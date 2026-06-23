import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Logger } from '../../utils/log4';
import { filterLogTemplate } from '../template/log';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const ip = request.headers['x-forwarded-for'] || request.ip;

    Logger.error(
      filterLogTemplate({
        url: request.originalUrl,
        method: request.method,
        ip: ip,
        statusCode: status,
        response: exception,
      }),
    );
    response.status(status).json(
      exception.getResponse
        ? exception.getResponse()
        : {
            statusCode: status,
            error: 'Service Error',
            message: `${exception}`,
          },
    );
  }
}
