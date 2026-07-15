import {
  Controller,
  ExecutionContext,
  ForbiddenException,
  Get,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PublicRoute } from '../decorator/public_route.decorator';
import { PermissionGuard } from './permission.guard';

@Controller('tabs/app')
class TestAppController {
  @Get('/:id')
  detail() {}

  @Get('/public')
  @PublicRoute()
  publicRoute() {}
}

const createContext = (
  request: Record<string, any>,
  handler = TestAppController.prototype.detail,
): ExecutionContext =>
  ({
    getClass: () => TestAppController,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as unknown as ExecutionContext;

describe('PermissionGuard', () => {
  it('matches permissions using the same controller and handler metadata as the sync service', async () => {
    const guard = new PermissionGuard();
    (guard as any).reflector = new Reflector();
    (guard as any).userService = {
      getPermissions: jest.fn().mockResolvedValue([
        {
          method: 'GET',
          url: '/tabs/app/:id',
          isStale: false,
        },
      ]),
    };

    const request = {
      user: { _id: 'user-id' },
      method: 'GET',
      // Express 的运行时 path 可能只包含方法路径，守卫不应依赖它。
      route: { path: '/:id', methods: { get: true } },
    };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
  });

  it('skips role permission checks only for explicitly public routes', async () => {
    const guard = new PermissionGuard();
    const getPermissions = jest.fn();
    (guard as any).reflector = new Reflector();
    (guard as any).userService = { getPermissions };

    await expect(
      guard.canActivate(
        createContext(
          { user: { _id: 'user-id' }, method: 'GET' },
          TestAppController.prototype.publicRoute,
        ),
      ),
    ).resolves.toBe(true);
    expect(getPermissions).not.toHaveBeenCalled();
  });

  it('returns 403 when an authenticated user lacks a route permission', async () => {
    const guard = new PermissionGuard();
    (guard as any).reflector = new Reflector();
    (guard as any).userService = {
      getPermissions: jest.fn().mockResolvedValue([]),
    };

    try {
      await guard.canActivate(
        createContext({ user: { _id: 'user-id' }, method: 'GET' }),
      );
      throw new Error('expected PermissionGuard to reject the request');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as ForbiddenException).getStatus()).toBe(403);
    }
  });
});
