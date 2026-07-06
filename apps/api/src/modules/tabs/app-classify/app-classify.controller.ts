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
import { AppClassifyService } from './app-classify.service';
import {
  AppClassifyDto,
  AppClassifyQueryDto,
} from './dto/app-classify.dto';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';

@ApiTags('新标签页/应用/分类')
@Controller('tabs/app-classify')
export class AppClassifyController {
  constructor(private readonly categoryService: AppClassifyService) {}

  @Get('/')
  @RequireLogin()
  @ApiOperation({ summary: '应用分类分页' })
  list(@Query() query: PageDto & AppClassifyQueryDto) {
    return this.categoryService.list(query);
  }

  @Get('/all')
  @ApiOperation({ summary: '启用应用分类' })
  getAllEnabled() {
    return this.categoryService.listEnabled();
  }

  @Get('/public/level1')
  @ApiOperation({ summary: '有应用的一级分类' })
  getPublicLevel1() {
    return this.categoryService.listPublicLevel1();
  }

  @Get('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '应用分类详情' })
  detail(@Param('id') id: string) {
    return this.categoryService.detail(id);
  }

  @Post('/')
  @RequireLogin()
  @ApiOperation({ summary: '新增应用分类' })
  create(@Body() body: AppClassifyDto, @User('_id') user: string) {
    return this.categoryService.create(body, user);
  }

  @Put('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '更新应用分类' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<AppClassifyDto>,
    @User('_id') user: string,
  ) {
    return this.categoryService.update(id, body, user);
  }

  @Delete('/:id')
  @RequireLogin()
  @ApiOperation({ summary: '删除应用分类' })
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }

  @Put('/:id/enable')
  @RequireLogin()
  @ApiOperation({ summary: '切换应用分类启用状态' })
  toggleEnable(@Param('id') id: string, @User('_id') user: string) {
    return this.categoryService.toggleEnable(id, user);
  }
}
