import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { LegalDocumentService } from 'src/modules/system/legal-document/legal-document.service';
import { UsersService } from 'src/modules/users/users.service';
import { PUBLIC_ROUTE_KEY } from '../decorator/public_route.decorator';
import { SKIP_LEGAL_CONFIRMATION_KEY } from '../decorator/skip-legal-confirmation.decorator';

@Injectable()
export class LegalConfirmationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly legalDocumentService: LegalDocumentService,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async isSuperAdministrator(userId: string) {
    const cacheKey = `system:legal-confirmation:super-administrator:${userId}`;
    const cached = await this.cacheManager.get<boolean>(cacheKey);
    if (typeof cached === 'boolean') return cached;

    const administrator =
      await this.usersService.isSuperAdministrator(userId);
    await this.cacheManager.set(cacheKey, administrator, 300_000);
    return administrator;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publicRoute = this.reflector.getAllAndOverride(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const skipped = this.reflector.getAllAndOverride(
      SKIP_LEGAL_CONFIRMATION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (publicRoute || skipped) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;
    if (!user) return true;
    if (await this.isSuperAdministrator(String(user._id))) return true;

    const signature = await this.legalDocumentService.currentConsentSignature();
    if (!signature) return true;

    const cacheKey = `system:legal-confirmation:${user._id}:${signature}`;
    if (await this.cacheManager.get(cacheKey)) return true;

    const pending = await this.legalDocumentService.getPendingRequiredDocuments(
      String(user._id),
    );
    if (!pending.length) {
      await this.cacheManager.set(cacheKey, true, 300_000);
      return true;
    }

    throw new HttpException(
      {
        statusCode: 428,
        code: 'LEGAL_CONFIRMATION_REQUIRED',
        reason: 'unconfirmed',
        message: '请确认最新的服务条款和隐私政策',
        documents: pending,
      },
      428,
    );
  }
}
