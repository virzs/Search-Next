import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '../../utils/log4';
import { logTemplate } from '../template/log';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const code = res.statusCode; // 响应状态码
    next();
    // 组装日志信息
    const logFormat = `Method: ${req.method} \n Request original url: ${req.originalUrl} \n IP: ${req.ip} \n Status code: ${code} \n`;
    // 根据状态码，进行日志类型区分
    if (code >= 500) {
      Logger.error(logFormat);
    } else if (code >= 400) {
      Logger.warn(logFormat);
    } else {
      Logger.access(logFormat);
      Logger.log(logFormat);
    }
  }
}

// 函数式中间件
export function logger(req: Request, res: Response, next: () => any) {
  const code = res.statusCode; // 响应状态码
  const ip = req.headers['x-forwarded-for'] || req.ip;
  next();
  // 组装日志信息
  const logFormat = logTemplate({
    url: req.originalUrl,
    method: req.method,
    ip: ip,
    statusCode: code,
    cookies: req.cookies,
    params: req.params,
    query: req.query,
    body: req.body,
  });

  // 根据状态码，进行日志类型区分
  if (code >= 500) {
    Logger.error(logFormat);
  } else if (code >= 400) {
    Logger.warn(logFormat);
  } else {
    Logger.access(logFormat);
    Logger.log(logFormat);
  }
}
