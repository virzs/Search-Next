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
import { TagService } from './tag.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { User } from 'src/public/decorator/route-user.decoratpr';
import {
  TagDto,
  TagForAdminDto,
  TagForUserDto,
  UpdateTagDto,
  TagWebsiteRelationDto,
  BatchUpdateTagStatusDto,
  QuickCreateTagDto,
  SearchTagDto,
} from '../dto/tag';

@ApiTags('新标签页/网站/标签')
@Controller('tabs/website_tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('/')
  @ApiOperation({ summary: '标签分页' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  @ApiParam({ name: 'search', description: '搜索关键词', required: false })
  @ApiParam({ name: 'enable', description: '是否启用', required: false })
  getTags(@Query() query: TagForAdminDto) {
    return this.tagService.getTags(query);
  }

  @Get('/user')
  @ApiOperation({ summary: '用户标签分页' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  @ApiParam({ name: 'search', description: '搜索关键词', required: false })
  getTagsForUser(@Query() query: TagForUserDto) {
    return this.tagService.getTagsForUser(query);
  }

  @Get('/all')
  @ApiOperation({ summary: '启用标签列表' })
  getAllEnabledTags() {
    return this.tagService.getAllEnabledTags();
  }

  @Get('/search')
  @ApiOperation({ summary: '搜索标签' })
  @ApiParam({ name: 'search', description: '搜索关键词' })
  searchTagsByName(@Query() query: SearchTagDto) {
    return this.tagService.searchTagsByName(query);
  }

  @Post('/quick')
  @ApiOperation({ summary: '快速创建标签' })
  quickCreateTag(@Body() body: QuickCreateTagDto, @User('_id') user: string) {
    return this.tagService.quickCreateTag(body, user);
  }

  @Post('/')
  @ApiOperation({ summary: '创建标签' })
  createTag(@Body() body: TagDto, @User('_id') user: string) {
    return this.tagService.createTag(body, user);
  }

  @Put('/batch-status')
  @ApiOperation({ summary: '批量更新标签状态' })
  batchUpdateTagStatus(@Body() body: BatchUpdateTagStatusDto) {
    return this.tagService.batchUpdateTagStatus(body);
  }

  @Post('/relation')
  @ApiOperation({ summary: '添加网站标签' })
  addTagWebsiteRelation(@Body() body: TagWebsiteRelationDto) {
    return this.tagService.manageTagWebsiteRelation(body, 'add');
  }

  @Delete('/relation')
  @ApiOperation({ summary: '移除网站标签' })
  removeTagWebsiteRelation(@Body() body: TagWebsiteRelationDto) {
    return this.tagService.manageTagWebsiteRelation(body, 'remove');
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新标签' })
  updateTag(
    @Param('id') id: string,
    @Body() body: UpdateTagDto,
    @User('_id') user: string,
  ) {
    return this.tagService.updateTag(id, body, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除标签' })
  deleteTag(@Param('id') id: string) {
    return this.tagService.deleteTag(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: '标签详情' })
  getTagDetail(@Param('id') id: string) {
    return this.tagService.getTagDetail(id);
  }
}
