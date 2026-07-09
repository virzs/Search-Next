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
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SearchEngineService } from './search-engine.service';
import {
  CreateSearchEngineDto,
  UpdateSearchEngineDto,
} from './dto/search-engine.dto';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';

@ApiTags('新标签页/搜索引擎')
@Controller('tabs/search-engine')
export class SearchEngineController {
  constructor(private readonly searchEngineService: SearchEngineService) {}

  @Get('/')
  @ApiOperation({ summary: '搜索引擎分页' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  getPage(@Query() query: PageDto) {
    return this.searchEngineService.page(query);
  }

  @Get('/enabled')
  @RequireLogin()
  @ApiOperation({ summary: '启用搜索引擎列表' })
  getEnabledList() {
    return this.searchEngineService.listEnabled();
  }

  @Get('/export')
  @ApiOperation({ summary: '导出搜索引擎' })
  exportAll() {
    return this.searchEngineService.exportAll();
  }

  @Post('/import')
  @ApiOperation({ summary: '导入搜索引擎' })
  importAll(@Body() body: unknown, @User('_id') user: string) {
    return this.searchEngineService.importAll(body, user);
  }

  @Post('/')
  @ApiOperation({ summary: '创建搜索引擎' })
  create(@Body() body: CreateSearchEngineDto, @User('_id') user: string) {
    return this.searchEngineService.create(body, user);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新搜索引擎' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateSearchEngineDto,
    @User('_id') user: string,
  ) {
    return this.searchEngineService.update(id, body, user);
  }

  @Put('/:id/enable')
  @ApiOperation({ summary: '切换搜索引擎启用状态' })
  toggleEnable(
    @Param('id') id: string,
    @User('_id') user: string,
  ) {
    return this.searchEngineService.toggleEnable(id, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除搜索引擎' })
  delete(@Param('id') id: string) {
    return this.searchEngineService.delete(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: '搜索引擎详情' })
  detail(@Param('id') id: string) {
    return this.searchEngineService.detail(id);
  }
}
