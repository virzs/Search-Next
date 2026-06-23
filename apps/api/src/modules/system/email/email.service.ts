import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import CaptchaTemplate from 'src/public/template/email/captcha';
import { Logger } from 'src/utils/log4';
import { SendEmailDto } from './dtos/send.dto';
import dayjs from 'dayjs';
import EmailUtil from './email.util';
import { RedisConstants } from 'src/common/constants/redis';
import ResetPwdCaptchaTemplate from 'src/public/template/email/resetPwdCaptcha';
import { UsersService } from 'src/modules/users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly userService: UsersService,
  ) {}

  async sendEmail(to: string) {
    const emailConfig = this.configService.get('email');
    const transporter = EmailUtil.init(emailConfig);

    const info = await transporter.sendMail({
      from: emailConfig.user,
      to: to,
      ...CaptchaTemplate('123456'),
    });

    if (info.messageId) {
      Logger.info(`Message sent: %s`, info.messageId);
      return 'success';
    }

    return info;
  }

  async getCaptcha(cacheKey, email: string) {
    const key = `${cacheKey}:${email}`;

    // 随机6位数字
    const captcha = Math.random().toString().slice(-6);
    // 获取缓存中的验证码
    const cache: any = await this.cacheManager.get(key);

    if (cache) {
      const { lastRequestTime } = cache;
      const now = dayjs();
      const diff = now.diff(dayjs(lastRequestTime), 'second');
      if (diff < 60)
        throw new BadGatewayException(
          `请勿重复获取验证码，请于 ${60 - diff} 秒后重试`,
        );
    }

    return { key, value: captcha };
  }

  async sendRegisterEmail({ email }: SendEmailDto) {
    const emailConfig = this.configService.get('email');
    const transporter = EmailUtil.init(emailConfig);

    // 随机6位数字
    const captcha = await this.getCaptcha(
      RedisConstants.EMAIL_REGISTER_CAPTCHA_KEY,
      email,
    );

    const info = await transporter.sendMail({
      from: emailConfig.user,
      to: email,
      ...CaptchaTemplate(captcha.value),
    });

    if (info.messageId) {
      await this.cacheManager.set(
        captcha.key,
        { captcha: captcha.value, lastRequestTime: new Date() },
        5 * 60 * 1000,
      );
      Logger.info(`Message sent:`, info.messageId, 'Cache set', captcha.key);
      return 'success';
    }

    return info;
  }

  async sendResetPasswordEmail({ email }: SendEmailDto) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('该邮箱未注册');
    }

    const emailConfig = this.configService.get('email');
    const transporter = EmailUtil.init(emailConfig);

    // 随机6位数字
    const captcha = await this.getCaptcha(
      RedisConstants.EMAIL_RESET_PASSWORD_CAPTCHA_KEY,
      email,
    );

    const info = await transporter.sendMail({
      from: emailConfig.user,
      to: email,
      ...ResetPwdCaptchaTemplate(captcha.value),
    });

    if (info.messageId) {
      await this.cacheManager.set(
        captcha.key,
        { captcha: captcha, lastRequestTime: new Date() },
        5 * 60 * 1000,
      );
      Logger.info(`Message sent:`, info.messageId, 'Cache set', captcha.key);
      return 'success';
    }

    return info;
  }
}
