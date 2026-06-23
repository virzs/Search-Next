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
import { WidgetClassifyService } from './widget-classify.service';
import {
  WidgetClassifyDto,
  WidgetClassifyQueryDto,
} from './dto/widget-classify.dto';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';

@ApiTags('新标签页/小组件/分类')
@Controller('tabs/widget-classify')
export class WidgetClassifyController {
  constructor(private readonly categoryService: WidgetClassifyService) {}

  @Get('/')
  @RequireLogin()
  @ApiOperation({ summary: '小组件分类分页' })
  list(@Query() query: PageDto & WidgetClassifyQueryDto) {
    return this.categoryService.list(query);
  }

  @Get('/all')
  @ApiOperation({ summary: '获取所有启用的小组件分类' })
  getAllEnabled() {
    return this.categoryService.listEnabled();
  }

  @Get('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '小组件分类详情' })
  detail(@Param('id') id: string) {
    return this.categoryService.detail(id);
  }

  @Post('/')
  @RequireLogin()
  @ApiOperation({ summary: '新增小组件分类' })
  create(@Body() body: WidgetClassifyDto, @User('_id') user: string) {
    return this.categoryService.create(body, user);
  }

  @Put('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '更新小组件分类' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<WidgetClassifyDto>,
    @User('_id') user: string,
  ) {
    return this.categoryService.update(id, body, user);
  }

  @Delete('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '删除小组件分类（软删除）' })
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }

  @Put('/:id/enable')
  @RequireLogin()
  @ApiOperation({ summary: '切换小组件分类启用状态' })
  toggleEnable(@Param('id') id: string, @User('_id') user: string) {
    return this.categoryService.toggleEnable(id, user);
  }
}
