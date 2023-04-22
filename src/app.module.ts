import { Module } from '@nestjs/common';
import {
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { SharedModule } from './shared/shared.module';
import { LoggerInterceptor } from './shared/interceptors/logger.interceptor';
import { PrometheusStatsInterceptor } from './shared/interceptors/prometheus-stats.interceptor';
import { NftStoreService } from './nft-store/nft-store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CollectionEntity,
  NftEntity,
  TransactionEntity,
  UserEntity,
} from './database/entities';
import { EventQueryService } from './event-query/event-query.service';
import { LoggerService } from './shared/services/logger/logger.service';
import { HttpModule } from '@nestjs/axios/dist';

@Module({
  imports: [
    DatabaseModule,
    SharedModule,
    ConfigModule,
    HttpModule,
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
    TypeOrmModule.forFeature([
      NftEntity,
      CollectionEntity,
      TransactionEntity,
      UserEntity,
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusStatsInterceptor,
    },
    makeHistogramProvider({
      name: 'http_requests',
      help: 'Http requests stats',
      labelNames: ['method', 'route', 'status_code', 'execution_time'],
    }),
    NftStoreService,
    EventQueryService,
    LoggerService,
  ],
})
export class AppModule {}
