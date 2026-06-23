import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { jwtConfig } from 'src/config/jwt';

declare module 'express' {
  interface Request {
    user: any;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject()
  private readonly reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (requireLogin !== undefined) {
      return requireLogin;
    }

    // 可选登录：有 token 则解析设置 request.user；无 token 也放行
    const optionalLogin = this.reflector.getAllAndOverride('optional-login', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (optionalLogin) {
      const authorization = request.headers.authorization;
      if (authorization) {
        try {
          const token = authorization.split(' ')[1];
          const data = this.jwtService.verify(token, {
            secret: jwtConfig.accessToken.secret,
          });
          request.user = data.user ?? data;
        } catch (e) {
          throw new UnauthorizedException('token 失效，请重新登录');
        }
      }
      return true;
    }

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('用户未登录');
    }

    try {
      const token = authorization.split(' ')[1];

      const data = this.jwtService.verify(token, {
        secret: jwtConfig.accessToken.secret,
      });

      request.user = data.user ?? data;
      return true;
    } catch (e) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
