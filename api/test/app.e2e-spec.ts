import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { db } from '../src/prisma/db.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'banking-consumer-test',
        },
      },
    });

    await app.startAllMicroservices();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/transfer (POST) and /statement/:id (GET) async flow', async () => {
    const fromWallet = `wallet-A-${Date.now()}`;
    const toWallet = `wallet-B-${Date.now()}`;

    // 1. Give wallet A some initial balance (hack for testing)
    await db.orm.public.Statement.create({ walletId: fromWallet, balance: 1000 });

    // 2. Request transfer
    const res = await request(app.getHttpServer())
      .post('/transfer')
      .send({
        fromWallet,
        toWallet,
        amount: 250
      })
      .expect(201);

    expect(res.body.status).toBe('PENDING');

    // 3. Poll for the CQRS read model to be updated by the background Kafka consumer
    let statementB: any = null;
    let attempts = 0;
    while (attempts < 50) { // wait up to 10 seconds (50 * 200ms)
      const resB = await request(app.getHttpServer()).get(`/statement/${toWallet}`);
      if (resB.body && resB.body.balance === 250) {
        statementB = resB.body;
        break;
      }
      await new Promise(r => setTimeout(r, 200));
      attempts++;
    }

    expect(statementB).not.toBeNull();
    expect(statementB.balance).toBe(250);

    // Verify wallet A
    const resA = await request(app.getHttpServer()).get(`/statement/${fromWallet}`);
    expect(resA.body.balance).toBe(750); // 1000 - 250
  }, 20000); // 20s timeout
});
