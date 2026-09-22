import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service.js';
import { TransferUseCase } from './application/transfer.use-case.js';
import { db } from './prisma/db.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly transferUseCase: TransferUseCase
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('transfer')
  async transfer(@Body() body: { fromWallet: string, toWallet: string, amount: number }) {
    const { fromWallet, toWallet, amount } = body;
    return this.transferUseCase.execute(fromWallet, toWallet, amount);
  }

  @Get('statement/:walletId')
  async getStatement(@Param('walletId') walletId: string) {
    const statement = await db.orm.public.Statement.where({ walletId }).first();
    
    if (!statement) {
      return { walletId, balance: 0, transactions: [] };
    }

    const transactions = await db.orm.public.EventStore.where({ walletId })
      .orderBy(m => m.createdAt.desc())
      .limit(50)
      .all();

    return {
      walletId: statement.walletId,
      balance: statement.balance,
      transactions: transactions
    };
  }
}
