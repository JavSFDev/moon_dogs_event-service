import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { toJSON } from 'flatted';
import { LoggerService } from '../services/logger/logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    this.logger.info({
      message: `${req.url} - ${req.method} - request started`,
      channel: 'logger-interceptor',
    });
    const timeRequestStarted = Date.now();

    return next.handle().pipe(
      tap(() => {
        const requestTime = Date.now() - timeRequestStarted;
        this.logger.info({
          message: `${req.url} - ${req.method} - request finished with ${res.statusCode} in ${requestTime}ms`,
          channel: 'logger-interceptor',
        });
      }),
      catchError((error) => {
        const requestTime = Date.now() - timeRequestStarted;
        this.logger.info({
          message: `${req.url} - ${
            req.method
          } - request failed in ${requestTime}ms. Error: ${toJSON(error)}`,
          channel: 'logger-interceptor',
        });

        throw error;
      }),
    );
  }
}
