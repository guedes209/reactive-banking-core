import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { db } from '../prisma/db.js';

@Controller()
export class LedgerConsumer {

  @EventPattern('transaction.risk.approved')
  async handleTransactionApproved(@Payload() message: any) {
    const { transactionId, fromWallet, toWallet, amount } = message;

    // Debit fromWallet
    await db.orm.public.EventStore.create({
      id: `${transactionId}-debit`,
      walletId: fromWallet,
      amount: amount,
      type: 'DEBIT',
      status: 'COMPLETED'
    });

    // Credit toWallet
    await db.orm.public.EventStore.create({
      id: `${transactionId}-credit`,
      walletId: toWallet,
      amount: amount,
      type: 'CREDIT',
      status: 'COMPLETED'
    });
  }

  @EventPattern('transaction.risk.denied')
  async handleTransactionDenied(@Payload() message: any) {
    const { transactionId, fromWallet, amount } = message;

    // Record the failure
    await db.orm.public.EventStore.create({
      id: `${transactionId}-failed`,
      walletId: fromWallet,
      amount: amount,
      type: 'DEBIT',
      status: 'FAILED'
    });
  }
}
