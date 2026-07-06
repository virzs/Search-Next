import { SetMetadata } from '@nestjs/common';

// 允许登录/不登录：有效 token 设置 request.user；无 token 或无效 token 都放行
export const OptionalLogin = () => SetMetadata('optional-login', true);
