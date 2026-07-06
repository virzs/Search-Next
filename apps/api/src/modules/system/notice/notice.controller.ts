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
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';
import { User } from 'src/public/decorator/route-user.decoratpr';
import {
  SystemNoticeDto,
  SystemNoticeForAdminDto,
  SystemNoticePublicQueryDto,
} from 'src/modules/system/notice/notice.dto';
import { NoticeService } from 'src/modules/system/notice/notice.service';

@ApiTags('系统/通知')
@Controller('system/notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get('/public/list')
  @RequireLogin()
  @ApiOperation({ summary: '生效通知列表' })
  @ApiQuery({ name: 'key', description: '模块Key（如 tabs）', required: true })
  getAllForPublic(@Query() query: SystemNoticePublicQueryDto) {
    return this.noticeService.getAllForPublic(query.key);
  }

  @Get('/')
  @ApiOperation({ summary: '通知分页' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  page(@Query() query: SystemNoticeForAdminDto) {
    return this.noticeService.page(query);
  }

  @Post('/')
  @ApiOperation({ summary: '创建通知' })
  create(@Body() body: SystemNoticeDto, @User('_id') user: string) {
    return this.noticeService.create(body, user);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新通知' })
  update(
    @Param('id') id: string,
    @Body() body: SystemNoticeDto,
    @User('_id') user: string,
  ) {
    return this.noticeService.update(id, body, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除通知' })
  delete(@Param('id') id: string, @User('_id') user: string) {
    return this.noticeService.delete(id, user);
  }

  @Get('/:id')
  @ApiOperation({ summary: '通知详情' })
  detail(@Param('id') id: string) {
    return this.noticeService.detail(id);
  }
}
