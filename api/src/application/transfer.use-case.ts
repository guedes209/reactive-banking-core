import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

@Injectable()
export class TransferUseCase {
  private readonly logger = new Logger(TransferUseCase.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async execute(fromWallet: string, toWallet: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const transactionId = randomUUID();
    
    this.logger.log(`[1] 🚀 Iniciando transferência: ${fromWallet} -> ${toWallet} | Valor: $${amount} | TxID: ${transactionId}`);
    
    // Emit TransactionRequestedEvent
    this.kafkaClient.emit('transaction.requested', {
      transactionId,
      fromWallet,
      toWallet,
      amount,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`[2] 📤 Evento 'transaction.requested' publicado no Kafka com sucesso!`);

    return {
      status: 'PENDING',
      transactionId,
      message: 'Transfer request received and is being processed.'
    };
  }
}

