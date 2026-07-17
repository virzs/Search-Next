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
import { jwtConfig } from 'src/config/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { PUBLIC_ROUTE_KEY } from '../decorator/public_route.decorator';

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

  @Inject(UsersService)
  private readonly usersService: UsersService;

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const publicRoute = this.reflector.getAllAndOverride(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (publicRoute) {
      return true;
    }

    // 可选登录：有效 token 设置 request.user；无 token 或无效 token 都放行
    const optionalLogin = this.reflector.getAllAndOverride('optional-login', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (optionalLogin) {
      const authorization = request.headers.authorization;
      if (authorization) {
        try {
          const token = authorization.split(' ')[1];
          const data = this.jwtService.verify(token, {
            secret: jwtConfig.accessToken.secret,
          });
          const user = data.user ?? data;
          const sessionValid = await this.usersService.validateSession(
            user._id,
            user.sessionVersion,
          );
          request.user = sessionValid ? user : undefined;
        } catch {
          request.user = undefined;
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

      const user = data.user ?? data;
      const sessionValid = await this.usersService.validateSession(
        user._id,
        user.sessionVersion,
      );
      if (!sessionValid) {
        throw new UnauthorizedException('登录已过期，请重新登录');
      }

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
