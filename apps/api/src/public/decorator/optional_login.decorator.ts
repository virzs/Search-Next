import { SetMetadata } from '@nestjs/common';

// 允许登录/不登录：有 token 则解析设置 request.user；无 token 也放行
export const OptionalLogin = () => SetMetadata('optional-login', true);