import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

@Injectable()
export class TransferUseCase {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async execute(fromWallet: string, toWallet: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const transactionId = randomUUID();
    
    // Emit TransactionRequestedEvent
    this.kafkaClient.emit('transaction.requested', {
      transactionId,
      fromWallet,
      toWallet,
      amount,
      timestamp: new Date().toISOString()
    });

    return {
      status: 'PENDING',
      transactionId,
      message: 'Transfer request received and is being processed.'
    };
  }
}

