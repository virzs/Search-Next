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

const createContext = (
  handler: () => void,
  authorization?: string,
): ExecutionContext =>
  ({
    getClass: () => TestController,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({
        headers: authorization ? { authorization } : {},
      }),
    }),
  }) as unknown as ExecutionContext;

describe('LoginGuard', () => {
  const createGuard = () => {
    const guard = new LoginGuard();
    (guard as any).reflector = new Reflector();
    (guard as any).jwtService = { verify: jest.fn() };
    (guard as any).usersService = {
      validateSession: jest.fn().mockResolvedValue(true),
    };
    return guard;
  };

  it('allows routes explicitly marked as public without a token', async () => {
    const guard = createGuard();

    await expect(
      guard.canActivate(createContext(TestController.prototype.publicRoute)),
    ).resolves.toBe(true);
  });

  it('requires a token for routes without a public marker', async () => {
    const guard = createGuard();

    await expect(
      guard.canActivate(createContext(TestController.prototype.protectedRoute)),
    ).rejects.toThrow('用户未登录');
  });

  it('still requires a token for routes that only skip role permissions', async () => {
    const guard = createGuard();

    await expect(
      guard.canActivate(createContext(TestController.prototype.loginOnlyRoute)),
    ).rejects.toThrow('用户未登录');
  });

  it('accepts a token whose session version is still active', async () => {
    const guard = createGuard();
    (guard as any).jwtService.verify.mockReturnValue({
      _id: 'user-1',
      sessionVersion: 2,
    });

    await expect(
      guard.canActivate(
        createContext(
          TestController.prototype.protectedRoute,
          'Bearer access-token',
        ),
      ),
    ).resolves.toBe(true);
    expect((guard as any).usersService.validateSession).toHaveBeenCalledWith(
      'user-1',
      2,
    );
  });

  it('rejects a token after the session version changes', async () => {
    const guard = createGuard();
    (guard as any).jwtService.verify.mockReturnValue({
      _id: 'user-1',
      sessionVersion: 2,
    });
    (guard as any).usersService.validateSession.mockResolvedValue(false);

    await expect(
      guard.canActivate(
        createContext(
          TestController.prototype.protectedRoute,
          'Bearer access-token',
        ),
      ),
    ).rejects.toThrow('token 失效，请重新登录');
  });
});
