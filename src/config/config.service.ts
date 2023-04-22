import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface Config {
  NODE_ENV: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  ETHERSCAN_API: string;
}

export enum NodeEnv {
  DEV = 'dev',
  PROD = 'prod',
}

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {
    this.getConfig();
  }

  getConfig(): Config {
    const nodeEnv = this.getRequired('NODE_ENV');
    if (!Object.values(NodeEnv).includes(nodeEnv as NodeEnv)) {
      throw new Error('Invalid NODE_ENV value');
    }

    return {
      NODE_ENV: nodeEnv,
      DB_HOST: this.getRequired('DB_HOST'),
      DB_PORT: +this.getRequired('DB_PORT'),
      DB_NAME: this.getRequired('DB_NAME'),
      DB_USER: this.getRequired('DB_USER'),
      DB_PASSWORD: this.getRequired('DB_PASSWORD'),
      ETHERSCAN_API: this.getRequired('ETHERSCAN_API'),
    };
  }

  private getRequired(name: string) {
    const value = this.configService.get<string>(name);
    if (value == null) {
      throw new Error(`You must provide ${name} env variable.`);
    }
    return value;
  }
}
