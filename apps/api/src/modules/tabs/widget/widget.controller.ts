import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WidgetService } from './widget.service';
import { WidgetDto, WidgetQueryDto } from './dto/widget.dto';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';

@ApiTags('新标签页/小组件')
@Controller('tabs/widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  // 获取公开可见的小组件列表（无需登录）
  @Get('/public')
  @RequireLogin()
  @ApiOperation({ summary: '公开小组件列表' })
  listPublic() {
    return this.widgetService.listPublic();
  }

  // 获取公开可见的小组件详情（无需登录）
  @Get('/public/:id')
  @RequireLogin()
  @ApiOperation({ summary: '公开小组件详情' })
  detailPublic(@Param('id') id: string) {
    return this.widgetService.detailPublic(id);
  }

  @Get('/')
  @RequireLogin()
  @ApiOperation({ summary: '小组件分页' })
  list(@Query() query: PageDto & WidgetQueryDto) {
    return this.widgetService.list(query);
  }

  @Get('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '小组件详情' })
  detail(@Param('id') id: string) {
    return this.widgetService.detail(id);
  }

  @Get('/:id/versions')
  @RequireLogin()
  @ApiOperation({ summary: '小组件版本列表' })
  versions(@Param('id') id: string) {
    return this.widgetService.listVersions(id);
  }

  @Post('/package')
  @RequireLogin()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '导入小组件包' })
  importPackage(
    @UploadedFile() file: Express.Multer.File,
    @Query('widgetId') widgetId: string,
    @User('_id') user: string,
  ) {
    return this.widgetService.importPackage(file, user, widgetId);
  }

  @Put('/:id/versions/:versionId/publish')
  @RequireLogin()
  @ApiOperation({ summary: '发布小组件版本' })
  publishVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @User('_id') user: string,
  ) {
    return this.widgetService.publishVersion(id, versionId, user);
  }

  @Post('/')
  @RequireLogin()
  @ApiOperation({ summary: '新增小组件' })
  create(@Body() body: WidgetDto, @User('_id') user: string) {
    return this.widgetService.create(body, user);
  }

  @Put('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '更新小组件' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<WidgetDto>,
    @User('_id') user: string,
  ) {
    return this.widgetService.update(id, body, user);
  }

  @Delete('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '删除小组件' })
  delete(@Param('id') id: string) {
    return this.widgetService.delete(id);
  }

  @Put('/:id/enable')
  @RequireLogin()
  @ApiOperation({ summary: '切换小组件启用状态' })
  toggleEnable(@Param('id') id: string, @User('_id') user: string) {
    return this.widgetService.toggleEnable(id, user);
  }
}
