import { Module } from '@nestjs/common';
import { TransferUseCase } from './transfer.use-case.js';
import { RiskConsumer } from './risk.consumer.js';
import { LedgerConsumer } from './ledger.consumer.js';

@Module({
  controllers: [RiskConsumer, LedgerConsumer],
  providers: [TransferUseCase],
  exports: [TransferUseCase]
})
export class ApplicationModule {}
