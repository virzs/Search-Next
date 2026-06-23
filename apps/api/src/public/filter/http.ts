import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '../../utils/log4';
import { filterLogTemplate } from '../template/log';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const ip = request.headers['x-forwarded-for'] || request.ip;

    Logger.info(
      filterLogTemplate({
        url: request.originalUrl,
        method: request.method,
        ip: ip,
        statusCode: status,
        response: response,
      }),
    );
    response.status(status).json(exception.getResponse());
  }
}
