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
import { WebsiteService } from './website.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PageDto } from 'src/public/dto/page';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';
import {
  ParseWebsiteDto,
  UpdateWebsitePublicDto,
  WebsiteDto,
  WebsiteForAdminDto,
  WebsitesForUserDto,
  WebsitesPublicDto,
} from './dto/website';
import { User } from 'src/public/decorator/route-user.decoratpr';

@ApiTags('新标签页/网站')
@Controller('tabs/website')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Get('/')
  @ApiOperation({ summary: '网站分页 (后台)' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  getWebsite(@Query() query: WebsiteForAdminDto) {
    return this.websiteService.getWebsites(query);
  }

  @Get('/user')
  @ApiOperation({ summary: '网站分页 (用户)' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  @ApiParam({ name: 'classify', description: '分类', example: ['123'] })
  @ApiParam({ name: 'tags', description: '标签', example: ['123'] })
  @ApiParam({ name: 'search', description: '搜索', example: '123' })
  getWebsiteForUser(@Query() query: WebsitesForUserDto) {
    return this.websiteService.getWebsitesForUser(query);
  }

  @Get('/public')
  @RequireLogin()
  @ApiOperation({ summary: '公开网站分页（精简字段）' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  @ApiParam({ name: 'classify', description: '分类', required: false })
  @ApiParam({ name: 'tags', description: '标签', required: false })
  @ApiParam({ name: 'search', description: '搜索', required: false })
  getPublicWebsitesLite(@Query() query: WebsitesPublicDto) {
    return this.websiteService.getPublicWebsitesLite(query);
  }

  @Get('/my')
  @ApiOperation({ summary: '我的网站' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  getMyWebsite(@Query() query: PageDto, @User('_id') user: string) {
    return this.websiteService.getMyWebsites(query, user);
  }

  @Post('/')
  @ApiOperation({ summary: '创建网站' })
  createWebsite(@Body() body: WebsiteDto, @User('_id') user: string) {
    return this.websiteService.addWebsite(body, user);
  }

  @Put('/public')
  @ApiOperation({ summary: '修改网站公开状态' })
  putWebsitePublic(@Body() body: UpdateWebsitePublicDto) {
    return this.websiteService.updateWebsitePublic(body);
  }

  @Get('/top50')
  @ApiOperation({ summary: '网站点击排行' })
  @RequireLogin()
  getTop50() {
    return this.websiteService.getTop50ClicksFromCache();
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新网站' })
  updateWebsite(
    @Param('id') id: string,
    @Body() body: WebsiteDto,
    @User('_id') user: string,
  ) {
    return this.websiteService.updateWebsite(id, body, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除网站' })
  deleteWebsite(@Param('id') id: string) {
    return this.websiteService.deleteWebsite(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: '网站详情' })
  getWebsiteDetail(@Param('id') id: string) {
    return this.websiteService.detail(id);
  }

  @Post('/parse')
  @ApiOperation({ summary: '解析网站信息' })
  @RequireLogin()
  parseWebsite(@Body() body: ParseWebsiteDto) {
    return this.websiteService.parseWebsiteMeta(body);
  }
}
