import { Controller, ExecutionContext, Get } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PublicRoute } from '../decorator/public_route.decorator';
import { SkipPermission } from '../decorator/skip_permission.decorator';
import { LoginGuard } from './login.guard';

@Controller('test')
class TestController {
  @Get('public')
  @PublicRoute()
  publicRoute() {}

  @Get('protected')
  protectedRoute() {}

  @Get('login-only')
  @SkipPermission()
  loginOnlyRoute() {}
}

const createContext = (handler: () => void): ExecutionContext =>
  ({
    getClass: () => TestController,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({ headers: {} }),
    }),
  }) as unknown as ExecutionContext;

describe('LoginGuard', () => {
  const createGuard = () => {
    const guard = new LoginGuard();
    (guard as any).reflector = new Reflector();
    (guard as any).jwtService = { verify: jest.fn() };
    return guard;
  };

  it('allows routes explicitly marked as public without a token', () => {
    const guard = createGuard();

    expect(
      guard.canActivate(createContext(TestController.prototype.publicRoute)),
    ).toBe(true);
  });

  it('requires a token for routes without a public marker', () => {
    const guard = createGuard();

    expect(() =>
      guard.canActivate(createContext(TestController.prototype.protectedRoute)),
    ).toThrow('用户未登录');
  });

  it('still requires a token for routes that only skip role permissions', () => {
    const guard = createGuard();

    expect(() =>
      guard.canActivate(createContext(TestController.prototype.loginOnlyRoute)),
    ).toThrow('用户未登录');
  });
});
