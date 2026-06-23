import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '../../utils/log4';
import { transformLogTemplate } from '../template/log';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.getArgByIndex(1).req;
    const ip = req.headers['x-forwarded-for'] || req.ip;
    return next.handle().pipe(
      map((data) => {
        const logFormat = transformLogTemplate({
          url: req.originalUrl,
          method: req.method,
          ip: ip,
          user: req.user,
          response: data?.data,
        });

        Logger.info(logFormat);
        Logger.access(logFormat);
        return data;
      }),
    );
  }
}
