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
  WebsiteCollectionDto,
  WebsiteCollectionForAdminDto,
  WebsiteCollectionPreviewDynamicDto,
  WebsiteCollectionWebsitesPageDto,
} from '../dto/collection';
import { CollectionService } from './collection.service';

@ApiTags('新标签页/网站/合集')
@Controller('tabs/website_collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get('/public/list')
  @RequireLogin()
  @ApiOperation({ summary: '公开合集列表' })
  getAllCollectionsForPublic() {
    return this.collectionService.getAllForPublic();
  }

  @Get('/public/:id/websites')
  @RequireLogin()
  @ApiOperation({ summary: '合集网站分页' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  getCollectionWebsitesPage(
    @Param('id') id: string,
    @Query() query: WebsiteCollectionWebsitesPageDto,
  ) {
    return this.collectionService.getCollectionWebsitesPage(id, query, true);
  }

  @Get('/')
  @ApiOperation({ summary: '合集分页' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  @ApiParam({ name: 'search', description: '搜索标题', required: false })
  getCollections(@Query() query: WebsiteCollectionForAdminDto) {
    return this.collectionService.getCollections(query);
  }

  @Post('/')
  @ApiOperation({ summary: '创建合集' })
  createCollection(@Body() body: WebsiteCollectionDto, @User('_id') user: string) {
    return this.collectionService.createCollection(body, user);
  }

  @Post('/preview_dynamic')
  @ApiOperation({ summary: '动态合集预览' })
  previewDynamic(@Body() body: WebsiteCollectionPreviewDynamicDto) {
    return this.collectionService.previewDynamic(body);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新合集' })
  updateCollection(
    @Param('id') id: string,
    @Body() body: WebsiteCollectionDto,
    @User('_id') user: string,
  ) {
    return this.collectionService.updateCollection(id, body, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除合集' })
  deleteCollection(@Param('id') id: string) {
    return this.collectionService.deleteCollection(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: '合集详情' })
  getCollectionDetail(@Param('id') id: string) {
    return this.collectionService.detail(id);
  }
}
