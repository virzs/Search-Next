// Redis 缓存 key 常量
export class RedisConstants {
  /**
   * 刷新token key
   */
  static readonly AUTH_REFRESH_TOKEN_KEY = 'auth:refresh-token';
  /**
   * 注册验证码 key
   */
  static readonly EMAIL_REGISTER_CAPTCHA_KEY = 'email:register-captcha';
  /**
   * 修改密码验证码
   */
  static readonly EMAIL_RESET_PASSWORD_CAPTCHA_KEY =
    'email:reset-password-captcha';
  /**
   * 角色权限缓存
   */
  static readonly ROLE_PERMISSIONS_KEY = 'role:permissions';
  /**
   * token黑名单
   */
  static readonly AUTH_TOKEN_BLACKLIST_KEY = 'auth:token-blacklist';
}
