import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';

@Injectable()
export class PrometheusStatsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests')
    private readonly histogram: Histogram<string>,
  ) {}

  private readonly EXCLUDE_METRICS_URLS = ['/metrics', '/healthcheck'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const timeRequestStarted = Date.now();

    return next.handle().pipe(
      tap(() => {
        const requestTime = Date.now() - timeRequestStarted;

        if (!this.EXCLUDE_METRICS_URLS.includes(req.url)) {
          this.histogram.observe(
            {
              method: req.method,
              route: req.url,
              status_code: res.statusCode,
              execution_time: requestTime,
            },
            requestTime,
          );
        }
      }),
      catchError((error) => {
        const requestTime = Date.now() - timeRequestStarted;

        this.histogram.observe(
          {
            method: req.method,
            route: req.url,
            status_code: error?.status || res.statusCode,
            execution_time: requestTime,
          },
          requestTime,
        );

        throw error;
      }),
    );
  }
}
