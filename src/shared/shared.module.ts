import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { LoggerService } from './services/logger/logger.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [LoggerModule.forRoot(), ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class SharedModule {}
