import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UsersService } from 'src/modules/users/users.service';

declare module 'express' {
  interface Request {
    user: any;
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(UsersService)
  private readonly userService: UsersService;

  @Inject()
  private readonly reflector: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (requireLogin !== undefined) {
      return requireLogin;
    }

    // 可选登录的路由无需权限校验
    const optionalLogin = this.reflector.getAllAndOverride('optional-login', [
      context.getClass(),
      context.getHandler(),
    ]);
    if (optionalLogin) {
      return true;
    }

    const skipPermission = this.reflector.getAllAndOverride('skip-permission', [
      context.getClass(),
      context.getHandler(),
    ]);
    if (skipPermission) {
      return true;
    }

    const { route, user } = request;

    if (!user) {
      return true;
    }

    const { path, methods } = route;
    console.log(path, methods, user);
    const permissions = await this.userService.getPermissions(user);

    if (permissions === true) {
      return permissions;
    }

    const hasPermission = !!permissions.find((i) => {
      const routeMethods = Object.entries(methods)
        .filter((i) => i[1])
        .map((d) => d[0]);

      return i.url === path && routeMethods.includes(i.method.toLowerCase());
    });

    if (!hasPermission) {
      throw new UnauthorizedException('没有权限');
    }

    return true;
  }
}
