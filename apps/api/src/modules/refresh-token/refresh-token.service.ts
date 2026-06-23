import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt';
import ms from 'ms';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * 创建refreshToken
   * @param user
   * @returns
   */
  createRefreshToken(user: any) {
    // BUG: https://github.com/nestjs/jwt/issues/1370
    // sign 时 expireation 会被忽略
    // 当前时间 + refreshToken 过期时间
    const expiresIn = Date.now() + ms(jwtConfig.refreshToken.expiresIn);
    const token = this.jwtService.sign(
      { ...user, expiresIn },
      {
        expiresIn: jwtConfig.refreshToken.expiresIn,
      },
    );
    return token;
  }

  async isRefreshTokenExpired(refreshToken: any) {
    const currentDate = Math.floor(Date.now() / 1000);
    const decoded = await this.jwtService.verifyAsync(refreshToken);
    const refreshTokenExpiration = new Date(decoded.exp);

    return refreshTokenExpiration.getTime() < currentDate;
  }

  /**
   * 判断refreshToken是否即将过期
   * @param refreshToken
   * @returns
   */
  async isRefreshTokenExpiresSoon(refreshToken: string) {
    const currentDate = Math.floor(Date.now() / 1000);
    const decoded = await this.jwtService.verifyAsync(refreshToken);
    // 由于 jwt sign 时 expiresIn 会被忽略，所以需要手动计算
    const refreshTokenExpiration = decoded.expiresIn; //new Date(decoded.exp);
    const refreshTTL = this.getTTL();

    return refreshTokenExpiration - currentDate < refreshTTL / 10;
  }

  getTTL() {
    return Math.floor(ms(jwtConfig.refreshToken.expiresIn));
  }
}
