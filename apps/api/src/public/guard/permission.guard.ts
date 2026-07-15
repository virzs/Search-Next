import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UsersService } from 'src/modules/users/users.service';
import {
  getRoutePermissionPaths,
  normalizePermissionPath,
} from 'src/modules/system/permission/permission-route.util';
import { PUBLIC_ROUTE_KEY } from '../decorator/public_route.decorator';

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

    const publicRoute = this.reflector.getAllAndOverride(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (publicRoute) {
      return true;
    }

    // 可选登录的路由无需权限校验
    const optionalLogin = this.reflector.getAllAndOverride('optional-login', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (optionalLogin) {
      return true;
    }

    const skipPermission = this.reflector.getAllAndOverride('skip-permission', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipPermission) {
      return true;
    }

    const { user } = request;

    if (!user) {
      return true;
    }

    const routePaths = getRoutePermissionPaths(
      this.reflector.get<string | string[]>(PATH_METADATA, context.getClass()),
      this.reflector.get<string | string[]>(PATH_METADATA, context.getHandler()),
    );
    const requestMethod = request.method?.toUpperCase();
    const permissions = await this.userService.getPermissions(user);

    if (permissions === true) {
      return permissions;
    }

    const hasPermission = !!permissions.find((i) => {
      return (
        !i.isStale &&
        routePaths.includes(normalizePermissionPath(i.url)) &&
        i.method?.toUpperCase() === requestMethod
      );
    });

    if (!hasPermission) {
      throw new ForbiddenException('没有权限');
    }

    return true;
  }
}
