import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload, ClientKafka } from '@nestjs/microservices';
import { RiskRules } from '../domain/risk.rules.js';
import { Transaction, TransactionStatus, TransactionType } from '../domain/transaction.value-object.js';

@Controller()
export class RiskConsumer {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  @EventPattern('transaction.requested')
  handleTransactionRequested(@Payload() message: any) {
    const { transactionId, fromWallet, amount, timestamp } = message;

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
      this.kafkaClient.emit('transaction.risk.approved', message);
    } else {
      this.kafkaClient.emit('transaction.risk.denied', message);
    }
  }
}

