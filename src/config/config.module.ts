import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ConfigService, NodeEnv } from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: getEnvFilePath(),
    }),
  ],
  exports: [ConfigService],
  providers: [ConfigService],
})
export class ConfigModule {}

function getEnvFilePath() {
  const nodeEnv = process.env.NODE_ENV || NodeEnv.DEV;
  const config = {
    [NodeEnv.DEV]: '.env',
    [NodeEnv.PROD]: '.env',
  };
  const env = config[nodeEnv];
  if (!env) {
    throw new Error(
      'You must provide NODE_ENV={dev,prod} environment variable',
    );
  }
  return env;
}
