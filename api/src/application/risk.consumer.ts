import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload, ClientKafka } from '@nestjs/microservices';
import { RiskRules } from '../domain/risk.rules.js';
import { Transaction, TransactionStatus, TransactionType } from '../domain/transaction.value-object.js';

@Controller()
export class RiskConsumer {
  private readonly logger = new Logger(RiskConsumer.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  @EventPattern('transaction.requested')
  handleTransactionRequested(@Payload() message: any) {
    const { transactionId, fromWallet, amount, timestamp } = message;
    
    this.logger.log(`[3] 📥 Recebido 'transaction.requested' (Risk Service) | TxID: ${transactionId}`);

    const tx = new Transaction(
      transactionId,
      fromWallet,
      amount,
      TransactionType.DEBIT,
      TransactionStatus.PENDING,
      new Date(timestamp)
    );

    const isSafe = RiskRules.isTransactionSafe(tx);

    if (isSafe) {
      this.logger.log(`[4] ✅ Risco Aprovado! Publicando 'transaction.risk.approved'...`);
      this.kafkaClient.emit('transaction.risk.approved', message);
    } else {
      this.logger.warn(`[4] ❌ Risco Negado (Fraude/Limite)! Publicando 'transaction.risk.denied'...`);
      this.kafkaClient.emit('transaction.risk.denied', message);
    }
  }
}

