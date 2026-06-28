import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ConsumerKeyService } from './consumer-key.service';

declare module 'express' {
  interface Request {
    aiConsumerKey?: any;
  }
}

@Injectable()
export class ConsumerKeyGuard implements CanActivate {
  constructor(private readonly consumerKeyService: ConsumerKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const rawKey = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : undefined;

    request.aiConsumerKey = await this.consumerKeyService.validateRawKey(rawKey);
    return true;
  }
}
