import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { db } from '../prisma/db.js';

@Controller()
export class LedgerConsumer {
  private readonly logger = new Logger(LedgerConsumer.name);

  @EventPattern('transaction.risk.approved')
  async handleTransactionApproved(@Payload() message: any) {
    const { transactionId, fromWallet, toWallet, amount } = message;

    this.logger.log(`[5] 📥 Recebido 'transaction.risk.approved' (Ledger Service) | TxID: ${transactionId}`);
    this.logger.log(`[6] 💾 Gravando Débito/Crédito e atualizando Saldo CQRS no PostgreSQL...`);

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

    // CQRS Read Model Updates
    const fromStmt = await db.orm.public.Statement.where({ walletId: fromWallet }).first();
    if (fromStmt) {
      await db.orm.public.Statement.where({ walletId: fromWallet }).update({ balance: fromStmt.balance - amount });
    } else {
      await db.orm.public.Statement.create({ walletId: fromWallet, balance: -amount });
    }

    const toStmt = await db.orm.public.Statement.where({ walletId: toWallet }).first();
    if (toStmt) {
      await db.orm.public.Statement.where({ walletId: toWallet }).update({ balance: toStmt.balance + amount });
    } else {
      await db.orm.public.Statement.create({ walletId: toWallet, balance: amount });
    }

    this.logger.log(`[7] 🎉 Ledger atualizado com sucesso! (Transferência Concluída) | TxID: ${transactionId}`);
  }

  @EventPattern('transaction.risk.denied')
  async handleTransactionDenied(@Payload() message: any) {
    const { transactionId, fromWallet, amount } = message;

    this.logger.warn(`[5] 📥 Recebido 'transaction.risk.denied' (Ledger Service) | TxID: ${transactionId}`);
    this.logger.log(`[6] 💾 Registrando falha no Event Store...`);

    // Record the failure
    await db.orm.public.EventStore.create({
      id: `${transactionId}-failed`,
      walletId: fromWallet,
      amount: amount,
      type: 'DEBIT',
      status: 'FAILED'
    });

    this.logger.log(`[7] 🛑 Transferência negada salva no histórico | TxID: ${transactionId}`);
  }
}
