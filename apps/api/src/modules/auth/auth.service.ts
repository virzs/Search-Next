import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/modules/users/schemas/user';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { Cache } from 'cache-manager';
import { jwtConfig } from 'src/config/jwt';
import { RedisConstants } from 'src/common/constants/redis';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { InvitationCodeService } from '../users/invitation-code/invitation-code.service';
import { ProjectService } from '../system/project/project.service';
import { SendEmailDto } from '../system/email/dtos/send.dto';
import { EmailService } from '../system/email/email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MessageService } from '../system/message/message.service';
import axios from 'axios';

interface RedisTokenCache {
  [key: string]: string;
}

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
    private readonly invitationCodeService: InvitationCodeService,
    private readonly projectService: ProjectService,
    private readonly emailService: EmailService,
    private readonly messageService: MessageService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  private getClientIp(headers?: Record<string, any>) {
    const forwarded =
      headers?.['cf-connecting-ip'] ?? headers?.['x-forwarded-for'];

    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }

    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim();
    }

    return undefined;
  }

  private async verifyTurnstileIfEnabled(
    token?: string,
    headers?: Record<string, any>,
    project?: any,
  ) {
    const currentProject = project ?? (await this.projectService.detail());
    const turnstile = currentProject?.turnstile;

    if (!turnstile?.enabled) {
      return;
    }

    if (!turnstile.siteKey || !turnstile.secretKey) {
      throw new BadRequestException('人机验证配置不完整');
    }

    if (!token) {
      throw new BadRequestException('请完成人机验证');
    }

    const payload = new URLSearchParams();
    payload.append('secret', turnstile.secretKey);
    payload.append('response', token);

    const remoteIp = this.getClientIp(headers);
    if (remoteIp) {
      payload.append('remoteip', remoteIp);
    }

    try {
      const { data } = await axios.post<TurnstileVerifyResponse>(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        payload.toString(),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (!data.success) {
        throw new BadRequestException('人机验证失败，请重试');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('人机验证失败，请重试');
    }
  }

  // 验证用户密码
  async validateUser(email: string, password: string): Promise<any> {
    // 根据邮箱查找用户
    const user = await this.usersModel
      .findOne({ email })
      .select(
        '+password +enable +status +roles +type +projects +integral +createdAt',
      )
      .lean();
    if (!user) {
      throw new BadRequestException('邮箱或密码错误');
    }

    const { password: userPassword, ...rest } = user;

    // 比较密码是否匹配
    const match = await bcrypt.compare(password, userPassword);
    if (!match) {
      throw new BadRequestException('邮箱或密码错误');
    }

    return rest;
  }

  async register(body: RegisterDto, headers?: Record<string, any>) {
    const { password, email, captcha, invitationCode, turnstileToken, ...rest } =
      body;

    const project = await this.projectService.detail();

    if (project?.register?.allowRegister === false)
      throw new BadRequestException(
        project?.register?.registerDisabledTip || '当前不允许注册',
      );

    await this.verifyTurnstileIfEnabled(turnstileToken, headers, project);

    if (project?.register?.forceEmailCaptcha) {
      if (!captcha) throw new BadRequestException('验证码错误');

      const cacheCaptcha: any = await this.cacheManager.get(
        `${RedisConstants.EMAIL_REGISTER_CAPTCHA_KEY}:${email}`,
      );
      if (!cacheCaptcha) throw new BadRequestException('验证码错误');

      if (cacheCaptcha.captcha !== captcha.toString())
        throw new BadRequestException('验证码错误');
    }

    const user = await this.usersModel.findOne({ email });
    if (user) throw new BadRequestException('邮箱已存在');

    if (project?.register?.forceInvitationCode && !invitationCode)
      throw new BadRequestException('邀请码不能为空');

    let codeData = null;
    // 如果有邀请码，检查邀请码是否有效
    if (invitationCode) {
      const code = await this.invitationCodeService.checkCode(invitationCode);
      if (!code) throw new BadRequestException('邀请码已失效');
      codeData = code;
    }

    // 生成盐值和加密后的密码
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.usersModel.create({
      ...rest,
      password: hashedPassword,
      salt,
      email,
      roles: codeData?.roles,
    });

    if (invitationCode) {
      await this.invitationCodeService.updateUsers(
        invitationCode,
        newUser._id.toString(),
      );
    }

    // 发送欢迎消息
    await this.messageService.sendMessageToUser(newUser._id.toString(), {
      key: 'image2',
      module: 'auth',
      title: '注册成功',
      content: '欢迎使用系统！',
      extra: {
        email: newUser.email,
        registerTime: new Date(),
      },
    });

    return { message: '注册成功' };
  }

  async sendRegisterCaptcha(body: SendEmailDto) {
    const project = await this.projectService.detail();
    if (project?.register?.allowRegister === false)
      throw new BadRequestException(
        project?.register?.registerDisabledTip || '当前不允许注册',
      );

    return this.emailService.sendRegisterEmail(body);
  }

  async login(body: LoginDto, headers) {
    const { password, email, turnstileToken } = body;
    await this.verifyTurnstileIfEnabled(turnstileToken, headers);

    const userAgent = headers['user-agent'];
    const user = await this.validateUser(email, password);

    const access_token = this.jwtService.sign({ ...user, userAgent });

    const refresh_token = this.refreshTokenService.createRefreshToken({
      ...user,
      userAgent,
    });

    if (!user) {
      throw new BadRequestException('邮箱或密码错误');
    }

    if (!user.enable) {
      throw new BadRequestException('用户已被禁用');
    }
    if (user.isDelete) {
      throw new BadRequestException('用户不存在');
    }

    const ttl = this.refreshTokenService.getTTL();

    // 获取当前用户所有的refreshToken
    const cache: RedisTokenCache = await this.cacheManager.get(
      `${RedisConstants.AUTH_REFRESH_TOKEN_KEY}:${user._id.toString()}`,
    );

    // 将新的refreshToken存入缓存，并限制最大设备数
    const newCache = {
      ...cache,
      [userAgent]: refresh_token,
    };
    const cacheKeys = Object.keys(newCache);
    if (cacheKeys.length > jwtConfig.refreshToken.maxDevices) {
      // 删除最早的一个refreshToken
      delete newCache[cacheKeys[0]];
    }

    this.cacheManager.set(
      `${RedisConstants.AUTH_REFRESH_TOKEN_KEY}:${user._id.toString()}`,
      newCache,
      ttl,
    );

    return {
      ...user,
      access_token,
      refresh_token,
    };
  }

  async refreshToken(body: RefreshTokenDto, headers) {
    const { refreshToken: postRefreshToken } = body;
    const userAgent = headers['user-agent'];

    const decoded = await this.jwtService.verifyAsync(postRefreshToken);

    if (!decoded) throw new UnauthorizedException('登录已过期');

    if (decoded.userAgent !== userAgent)
      throw new UnauthorizedException('登录已过期 userAgent changed');

    const cache: RedisTokenCache = await this.cacheManager.get(
      `${RedisConstants.AUTH_REFRESH_TOKEN_KEY}:${decoded._id.toString()}`,
    );

    if (!cache) {
      throw new UnauthorizedException('登录已过期 no cache');
    }

    const refreshToken = cache[userAgent];

    if (!refreshToken) {
      throw new UnauthorizedException(
        '登录已过期或 userAgent 变更 no refresh token or userAgent changed',
      );
    }

    const isExpired =
      await this.refreshTokenService.isRefreshTokenExpired(refreshToken);

    const isExpiresSoon =
      await this.refreshTokenService.isRefreshTokenExpiresSoon(refreshToken);

    if (isExpired) {
      throw new UnauthorizedException('登录已过期 expired');
    }

    const { exp, iat, ...tokenRest } = decoded;

    const newAccessToken = this.jwtService.sign({
      ...tokenRest,
      userAgent,
    });

    const newTTL = this.refreshTokenService.getTTL();

    const newRefreshToken = this.refreshTokenService.createRefreshToken({
      ...tokenRest,
      userAgent,
    });

    this.cacheManager.set(
      `${RedisConstants.AUTH_REFRESH_TOKEN_KEY}:${decoded._id.toString()}`,
      {
        ...cache,
        [userAgent]: newRefreshToken,
      },
      newTTL,
    );

    return {
      access_token: newAccessToken,
      ...(isExpiresSoon ? { refresh_token: newRefreshToken } : {}),
    };
  }

  async logout(accessToken: string, headers) {
    const userAgent = headers['user-agent'];

    const accessCache = await this.cacheManager.get(`
    ${RedisConstants.AUTH_TOKEN_BLACKLIST_KEY}:${accessToken}`);

    const user: any = this.jwtService.decode(
      accessToken.replace('Bearer ', ''),
    );
    const cached = await this.cacheManager.get(
      `${RedisConstants.AUTH_REFRESH_TOKEN_KEY}:${user._id.toString()}`,
    );
    const refreshToken = cached[userAgent];

    const refreshCache = await this.cacheManager.get(`
    ${RedisConstants.AUTH_TOKEN_BLACKLIST_KEY}:${refreshToken}`);

    if (refreshCache && accessCache) {
      return { message: '退出登录成功' };
    }

    const accessTTL = this.jwtService.decode(
      accessToken.replace('Bearer ', ''),
    )?.['exp'];
    const refreshTTL = this.jwtService.decode(refreshToken)?.['exp'];

    const accessExp = accessTTL - Math.floor(Date.now() / 1000);
    const refreshExp = refreshTTL - Math.floor(Date.now() / 1000);

    this.cacheManager.set(
      `${RedisConstants.AUTH_TOKEN_BLACKLIST_KEY}:${accessToken}`,
      accessToken,
      accessExp,
    );
    this.cacheManager.set(
      `${RedisConstants.AUTH_TOKEN_BLACKLIST_KEY}:${refreshToken}`,
      refreshToken,
      refreshExp,
    );
    return { message: '退出登录成功' };
  }
}
