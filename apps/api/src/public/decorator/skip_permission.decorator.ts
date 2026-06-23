import { SetMetadata } from '@nestjs/common';

// 标记为只校验登录态，不校验后台菜单权限
export const SkipPermission = () => SetMetadata('skip-permission', true);
