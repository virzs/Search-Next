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
import { RequireLogin } from 'src/public/decorator/require_login.decorator';
import { User } from 'src/public/decorator/route-user.decoratpr';
import {
  AppCollectionDto,
  AppCollectionForAdminDto,
  AppCollectionPreviewDynamicDto,
  AppCollectionAppsPageDto,
} from './dto/app-collection.dto';
import { AppCollectionService } from './app-collection.service';

@ApiTags('新标签页/应用/合集')
@Controller('tabs/app-collection')
export class AppCollectionController {
  constructor(private readonly collectionService: AppCollectionService) {}

  @Get('/public/list')
  @RequireLogin()
  @ApiOperation({ summary: '公开应用合集列表' })
  getAllCollectionsForPublic() {
    return this.collectionService.getAllForPublic();
  }

  @Get('/public/:id/apps')
  @RequireLogin()
  @ApiOperation({ summary: '合集应用分页' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  getCollectionAppsPage(
    @Param('id') id: string,
    @Query() query: AppCollectionAppsPageDto,
  ) {
    return this.collectionService.getCollectionAppsPage(id, query, true);
  }

  @Get('/')
  @ApiOperation({ summary: '应用合集分页' })
  getCollections(@Query() query: AppCollectionForAdminDto) {
    return this.collectionService.getCollections(query);
  }

  @Post('/')
  @ApiOperation({ summary: '创建应用合集' })
  createCollection(@Body() body: AppCollectionDto, @User('_id') user: string) {
    return this.collectionService.createCollection(body, user);
  }

  @Post('/preview_dynamic')
  @ApiOperation({ summary: '动态应用合集预览' })
  previewDynamic(@Body() body: AppCollectionPreviewDynamicDto) {
    return this.collectionService.previewDynamic(body);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新应用合集' })
  updateCollection(
    @Param('id') id: string,
    @Body() body: AppCollectionDto,
    @User('_id') user: string,
  ) {
    return this.collectionService.updateCollection(id, body, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除应用合集' })
  deleteCollection(@Param('id') id: string) {
    return this.collectionService.deleteCollection(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: '应用合集详情' })
  getCollectionDetail(@Param('id') id: string) {
    return this.collectionService.detail(id);
  }
}
