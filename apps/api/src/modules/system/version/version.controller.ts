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
import { VersionService } from './version.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PageDto } from 'src/public/dto/page';
import { VersionDto } from './dto/version.dto';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';

@ApiTags('系统/版本管理')
@Controller('system/version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get('/')
  @ApiOperation({ summary: '版本分页' })
  @ApiQuery({ type: PageDto })
  page(@Query() query: PageDto) {
    return this.versionService.page(query);
  }

  @Post('/')
  @ApiOperation({ summary: '创建版本' })
  create(@Body() body: VersionDto, @User('_id') user) {
    return this.versionService.create(body, user);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新版本' })
  update(@Param('id') id: string, @Body() body: VersionDto, @User('_id') user) {
    return this.versionService.update(id, body, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除版本' })
  delete(@Param('id') id: string, @User('_id') user) {
    return this.versionService.delete(id, user);
  }

  @Get('/latest')
  @RequireLogin()
  @ApiOperation({ summary: '最新版本' })
  latest(@Query('platform') platform: string) {
    return this.versionService.latest(platform);
  }

  @Get('/:id')
  @ApiOperation({ summary: '版本详情' })
  detail(@Param('id') id: string) {
    return this.versionService.detail(id);
  }
}
