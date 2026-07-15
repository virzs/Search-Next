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
import { ThemeConfigService } from './theme-config.service';
import {
  CreateThemeConfigDto,
  UpdateThemeConfigDto,
  ActiveThemeConfigQueryDto,
  ThemeConfigQueryDto,
} from './theme-config.dto';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { PublicRoute } from 'src/public/decorator/public_route.decorator';

@ApiTags('新标签页/桌面/主题配置')
@Controller('tabs/desktop/theme-config')
export class ThemeConfigController {
  constructor(private readonly themeConfigService: ThemeConfigService) {}

  @Get('/')
  @ApiOperation({ summary: '主题配置分页' })
  getThemeConfigs(@Query() query: PageDto & ThemeConfigQueryDto) {
    return this.themeConfigService.getThemeConfigs(query);
  }

  @Get('/active')
  @PublicRoute()
  @ApiOperation({ summary: '启用主题配置列表' })
  getActiveThemeConfigs(@Query() query: ActiveThemeConfigQueryDto) {
    return this.themeConfigService.getActiveThemeConfigs(query);
  }

  @Post('/')
  @ApiOperation({ summary: '创建主题配置' })
  createThemeConfig(
    @Body() body: CreateThemeConfigDto,
    @User('_id') user: string,
  ) {
    return this.themeConfigService.createThemeConfig(body, user);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新主题配置' })
  updateThemeConfig(
    @Param('id') id: string,
    @Body() body: UpdateThemeConfigDto,
    @User('_id') user: string,
  ) {
    return this.themeConfigService.updateThemeConfig(id, body, user);
  }

  @Put('/:id/toggle')
  @ApiOperation({ summary: '切换主题配置启用状态' })
  toggleThemeConfig(@Param('id') id: string, @User('_id') user: string) {
    return this.themeConfigService.toggleThemeConfig(id, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除主题配置' })
  deleteThemeConfig(@Param('id') id: string) {
    return this.themeConfigService.deleteThemeConfig(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: '主题配置详情' })
  getThemeConfigDetail(@Param('id') id: string) {
    return this.themeConfigService.getThemeConfigDetail(id);
  }
}
