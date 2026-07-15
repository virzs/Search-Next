import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'public-route';

/**
 * 明确公开的接口：跳过登录校验，也不生成后台角色权限。
 * 需要登录但不走后台角色权限的接口应使用 SkipPermission。
 */
export const PublicRoute = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
