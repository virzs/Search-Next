import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { PublicRoute } from 'src/public/decorator/public_route.decorator';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { LogoutDto } from './dtos/logout.dto';
import { SendEmailDto } from '../system/email/dtos/send.dto';
import { SkipPermission } from 'src/public/decorator/skip_permission.decorator';

@ApiTags('授权')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '用户注册' })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  @PublicRoute()
  register(@Body() body: RegisterDto, @Headers() headers) {
    return this.authService.register(body, headers);
  }

  @ApiOperation({ summary: '发送注册验证码' })
  @ApiBody({ type: RegisterDto })
  @PublicRoute()
  @Post('register/captcha')
  sendRegisterCaptcha(@Body() body: SendEmailDto) {
    return this.authService.sendRegisterCaptcha(body);
  }

  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  @PublicRoute()
  login(@Body() body: LoginDto, @Headers() headers) {
    return this.authService.login(body, headers);
  }

  @ApiOperation({ summary: '后台登录' })
  @ApiBody({ type: LoginDto })
  @Post('admin/login')
  @PublicRoute()
  adminLogin(@Body() body: LoginDto, @Headers() headers) {
    return this.authService.adminLogin(body, headers);
  }

  @ApiOperation({ summary: '刷新 Token' })
  @ApiBody({ type: RefreshTokenDto })
  @Post('refresh-token')
  @PublicRoute()
  refreshToken(@Body() body: RefreshTokenDto, @Headers() headers) {
    return this.authService.refreshToken(body, headers);
  }

  @ApiOperation({ summary: '退出登录' })
  @ApiBody({ type: LogoutDto })
  @Post('logout')
  @SkipPermission()
  logout(@Headers('authorization') authorization: string, @Headers() headers) {
    return this.authService.logout(authorization, headers);
  }
}
