import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DesktopConfigService } from './desktop-config.service';
import {
  CreateAdminDesktopConfigDto,
  UpdateAdminDesktopConfigDto,
  SetActiveAdminConfigDto,
  CreateUserDesktopConfigDto,
  UpdateUserDesktopConfigDto,
  SetDefaultUserConfigDto,
  DesktopConfigQueryDto,
} from './dto/desktop-config.dto';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';

@ApiTags('新标签页/桌面/桌面配置')
@Controller('tabs/desktop/config')
export class DesktopConfigController {
  constructor(private readonly desktopConfigService: DesktopConfigService) {}

  // 管理员配置相关接口
  @Get('/admin')
  @ApiOperation({ summary: '管理员配置分页' })
  getAdminConfigs(@Query() query: PageDto & DesktopConfigQueryDto) {
    return this.desktopConfigService.getAdminConfigs(query);
  }

  @Get('/admin/active')
  @RequireLogin()
  @ApiOperation({ summary: '获取当前激活的管理员配置' })
  getActiveAdminConfig() {
    return this.desktopConfigService.getActiveAdminConfig();
  }

  @Post('/admin')
  @ApiOperation({ summary: '创建管理员配置' })
  createAdminConfig(
    @Body() body: CreateAdminDesktopConfigDto,
    @User('_id') user: string,
  ) {
    return this.desktopConfigService.createAdminConfig(body, user);
  }

  @Put('/admin/:id')
  @ApiOperation({ summary: '更新管理员配置' })
  updateAdminConfig(
    @Param('id') id: string,
    @Body() body: UpdateAdminDesktopConfigDto,
    @User('_id') user: string,
  ) {
    return this.desktopConfigService.updateAdminConfig(id, body, user);
  }

  @Put('/admin/:id/active')
  @ApiOperation({ summary: '设置管理员配置激活状态' })
  setActiveAdminConfig(@Param('id') id: string, @User('_id') user: string) {
    return this.desktopConfigService.setActiveAdminConfig(id, user);
  }

  @Delete('/admin/:id')
  @ApiOperation({ summary: '删除管理员配置' })
  deleteAdminConfig(@Param('id') id: string) {
    return this.desktopConfigService.deleteAdminConfig(id);
  }

  @Get('/admin/:id')
  @ApiOperation({ summary: '管理员配置详情' })
  getAdminConfigDetail(@Param('id') id: string) {
    return this.desktopConfigService.getAdminConfigDetail(id);
  }

  // 用户配置相关接口
  @Get('/user')
  @ApiOperation({ summary: '用户配置分页' })
  getUserConfigs(
    @Query() query: PageDto & DesktopConfigQueryDto,
    @User('_id') userId: string,
  ) {
    return this.desktopConfigService.getUserConfigs(userId, query);
  }

  @Get('/user/default')
  @RequireLogin()
  @ApiOperation({ summary: '获取用户默认配置（未登录时返回系统激活配置）' })
  getUserDefaultConfig(@User('_id') userId?: string) {
    if (!userId) {
      // 未登录用户返回系统激活配置
      return this.desktopConfigService.getActiveAdminConfig();
    }
    return this.desktopConfigService.getUserDefaultConfig(userId);
  }

  @Post('/user')
  @ApiOperation({ summary: '创建用户配置' })
  createUserConfig(
    @Body() body: CreateUserDesktopConfigDto,
    @User('_id') userId: string,
    @User('roleIds') userRoleIds?: string[],
  ) {
    return this.desktopConfigService.createUserConfig(
      userId,
      body,
      userRoleIds,
    );
  }

  @Put('/user/:id')
  @ApiOperation({ summary: '更新用户配置' })
  updateUserConfig(
    @Param('id') id: string,
    @Body() body: UpdateUserDesktopConfigDto,
    @User('_id') userId: string,
    @User('roleIds') userRoleIds?: string[],
  ) {
    return this.desktopConfigService.updateUserConfig(
      id,
      userId,
      body,
      userRoleIds,
    );
  }

  @Put('/user/:id/default')
  @ApiOperation({ summary: '设置用户配置为默认' })
  setDefaultUserConfig(
    @Param('id') id: string,
    @Body() body: SetDefaultUserConfigDto,
    @User('_id') userId: string,
  ) {
    return this.desktopConfigService.setDefaultUserConfig(
      id,
      userId,
      body.isDefault,
    );
  }

  @Delete('/user/:id')
  @ApiOperation({ summary: '删除用户配置' })
  deleteUserConfig(@Param('id') id: string, @User('_id') userId: string) {
    return this.desktopConfigService.deleteUserConfig(id, userId);
  }

  @Get('/user/:id')
  @ApiOperation({ summary: '用户配置详情' })
  getUserConfigDetail(@Param('id') id: string, @User('_id') userId: string) {
    return this.desktopConfigService.getUserConfigDetail(id, userId);
  }
}
