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
import { AppService } from './app.service';
import {
  AppDto,
  AppPublicQueryDto,
  AppQueryDto,
} from './dto/app.dto';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';

@ApiTags('新标签页/应用')
@Controller('tabs/app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 获取公开可见的应用列表（无需登录）
  @Get('/public')
  @RequireLogin()
  @ApiOperation({ summary: '公开应用列表' })
  listPublic(@Query() query: AppPublicQueryDto) {
    return this.appService.listPublic(query);
  }

  // 获取公开可见的应用详情（无需登录）
  @Get('/public/:id')
  @RequireLogin()
  @ApiOperation({ summary: '公开应用详情' })
  detailPublic(@Param('id') id: string) {
    return this.appService.detailPublic(id);
  }

  @Get('/')
  @RequireLogin()
  @ApiOperation({ summary: '应用分页' })
  list(@Query() query: PageDto & AppQueryDto) {
    return this.appService.list(query);
  }

  @Get('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '应用详情' })
  detail(@Param('id') id: string) {
    return this.appService.detail(id);
  }

  @Get('/:id/versions')
  @RequireLogin()
  @ApiOperation({ summary: '应用版本列表' })
  versions(@Param('id') id: string) {
    return this.appService.listVersions(id);
  }

  @Post('/package')
  @RequireLogin()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '导入应用包' })
  importPackage(
    @UploadedFile() file: Express.Multer.File,
    @Query('appId') appId: string,
    @User('_id') user: string,
  ) {
    return this.appService.importPackage(file, user, appId);
  }

  @Put('/:id/versions/:versionId/publish')
  @RequireLogin()
  @ApiOperation({ summary: '发布应用版本' })
  publishVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @User('_id') user: string,
  ) {
    return this.appService.publishVersion(id, versionId, user);
  }

  @Post('/')
  @RequireLogin()
  @ApiOperation({ summary: '新增应用' })
  create(@Body() body: AppDto, @User('_id') user: string) {
    return this.appService.create(body, user);
  }

  @Put('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '更新应用' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<AppDto>,
    @User('_id') user: string,
  ) {
    return this.appService.update(id, body, user);
  }

  @Delete('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '删除应用' })
  delete(@Param('id') id: string) {
    return this.appService.delete(id);
  }

  @Put('/:id/enable')
  @RequireLogin()
  @ApiOperation({ summary: '切换应用启用状态' })
  toggleEnable(@Param('id') id: string, @User('_id') user: string) {
    return this.appService.toggleEnable(id, user);
  }
}
