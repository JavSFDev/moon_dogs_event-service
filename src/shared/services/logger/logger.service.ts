import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export enum LogLevels {
  Trace = 0,
  Debug = 100,
  Info = 200,
  Warn = 300,
  Error = 400,
  Critical = 500,
}

export enum ErrorTypes {
  BadRequest = 'bad_request',
  RunTimeFailure = 'run_time_failure',
}

export interface UserLog extends LogBase {
  levelName?: string;
  correlationId?: string;
  errorType?: ErrorTypes;
}

interface LogBase {
  channel: string;
  message: string;
  level?: LogLevels;
  datetime?: Date;
  service?: string;
  context?: string;
}

interface SnakeCaseLog extends LogBase {
  level_name?: string;
  correlation_id: string;
  error_type?: ErrorTypes;
}

const SERVICE_NAME = 'moondogs-marketplace-event-service';

@Injectable()
export class LoggerService {
  constructor(private logger: PinoLogger) {}

  private toSnakeCaseJSONString({
    level,
    levelName,
    datetime,
    service,
    channel,
    message,
    context,
    correlationId,
    errorType,
  }: UserLog): SnakeCaseLog {
    return {
      level,
      level_name: levelName,
      datetime: datetime || new Date(),
      service: service || SERVICE_NAME,
      channel,
      message,
      context,
      correlation_id: correlationId,
      error_type: errorType,
    };
  }

  private transformLog(log: UserLog): string {
    return JSON.stringify(this.toSnakeCaseJSONString(log));
  }

  info(data: UserLog): void {
    this.logger.info(
      this.transformLog({
        level: LogLevels.Info,
        levelName: 'Info',
        ...data,
      }),
    );
  }

  debug(data: UserLog): void {
    this.logger.debug(
      this.transformLog({
        level: LogLevels.Debug,
        levelName: 'Debug',
        ...data,
      }),
    );
  }

  warn(data: UserLog): void {
    this.logger.warn(
      this.transformLog({
        level: LogLevels.Warn,
        levelName: 'Warn',
        ...data,
      }),
    );
  }

  trace(data: UserLog): void {
    this.logger.trace(
      this.transformLog({
        level: LogLevels.Trace,
        levelName: 'Trace',
        ...data,
      }),
    );
  }

  error(data: UserLog): void {
    this.logger.error(
      this.transformLog({
        level: LogLevels.Error,
        levelName: 'Error',
        ...data,
      }),
    );
  }

  fatal(data: UserLog): void {
    this.logger.fatal(
      this.transformLog({
        level: LogLevels.Critical,
        levelName: 'Critical',
        ...data,
      }),
    );
  }
}
