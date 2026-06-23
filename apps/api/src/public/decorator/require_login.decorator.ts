import { SetMetadata } from '@nestjs/common';

// 标记需要登录为 true，忽略登录
export const RequireLogin = () => SetMetadata('require-login', true);
