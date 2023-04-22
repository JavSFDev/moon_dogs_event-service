import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { resolve } from 'path';

import { Config } from '../config/config.service';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import 'dotenv/config';

export const getOrmConfig = (env: Config): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: +env.DB_PORT, // need to convert this property again 'cause using this function also with process.env
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    schema: '',
    migrationsRun: false,
    migrations: [resolve(__dirname, './migrations/*{.ts,.js}')],
    entities: [resolve(__dirname, '../**/*.entity{.ts,.js}')],
    logging: true,
  };
};

const dataSource = new DataSource({
  ...(getOrmConfig(process.env as any) as PostgresConnectionOptions),
});

export default dataSource;
