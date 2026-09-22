import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { KafkaModule } from './infrastructure/kafka.module.js';
import { ApplicationModule } from './application/application.module.js';

@Module({
  imports: [KafkaModule, ApplicationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
