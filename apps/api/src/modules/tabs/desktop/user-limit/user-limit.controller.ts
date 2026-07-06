import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserLimitService } from './user-limit.service';
import {
  CreateUserConfigLimitDto,
  UpdateUserConfigLimitDto,
} from './dto/user-limit.dto';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { OptionalLogin } from 'src/public/decorator/optional_login.decorator';

@ApiTags('新标签页/桌面/用户限制')
@Controller('tabs/desktop/user-limit')
export class UserLimitController {
  constructor(private readonly userLimitService: UserLimitService) {}

  @Get('/')
  @ApiOperation({ summary: '用户配置限制' })
  getUserConfigLimit() {
    return this.userLimitService.getUserConfigLimit();
  }

  @Get('/public')
  @OptionalLogin()
  @ApiOperation({ summary: '公开用户配置限制' })
  async getUserConfigLimitPublic(@User('roles') roles) {
    return this.userLimitService.getUserLimitForRoles(roles);
  }

  @Post('/')
  @ApiOperation({ summary: '创建或更新用户配置限制' })
  createOrUpdateUserConfigLimit(
    @Body() body: CreateUserConfigLimitDto,
    @User('_id') user: string,
  ) {
    return this.userLimitService.createOrUpdateUserConfigLimit(body, user);
  }

  @Put('/')
  @ApiOperation({ summary: '更新用户配置限制' })
  updateUserConfigLimit(
    @Body() body: UpdateUserConfigLimitDto,
    @User('_id') user: string,
  ) {
    return this.userLimitService.updateUserConfigLimit(body, user);
  }
}
