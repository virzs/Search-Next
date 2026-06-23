import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClassifyService } from './classify.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';
import { WebsiteClassifyDto } from '../dto/classify';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { WebsiteClassify } from '../schemas/classify';
@ApiTags('新标签页/网站/分类')
@Controller('tabs/website_classify')
export class ClassifyController {
  constructor(private readonly classifyService: ClassifyService) {}

  @Get('/')
  @ApiOperation({ description: '分类树' })
  @ApiResponse({ status: 200, type: WebsiteClassify, isArray: true })
  treeInfo(@Param() query: any) {
    return this.classifyService.treeInfo(query);
  }

  @Get('/tree')
  @ApiOperation({ description: '分类树 (用户)' })
  @ApiResponse({ status: 200, type: WebsiteClassify, isArray: true })
  @RequireLogin()
  treeInfoForUser() {
    return this.classifyService.getClassifyTree();
  }

  @Get('/public/level1')
  @ApiOperation({ description: '一级分类（仅返回有网站的分类）' })
  @ApiResponse({ status: 200, type: WebsiteClassify, isArray: true })
  @RequireLogin()
  publicLevel1() {
    return this.classifyService.getPublicLevel1Classifies();
  }

  @Post('/')
  @ApiOperation({ description: '创建分类' })
  @ApiResponse({ status: 200, type: WebsiteClassify })
  createClassify(@Body() body: WebsiteClassifyDto, @User('_id') user: string) {
    return this.classifyService.createClassify(body, user);
  }

  @Put('/:id')
  @ApiOperation({ description: '更新分类' })
  @ApiResponse({ status: 200, type: WebsiteClassify })
  updateClassify(
    @Param('id') id: string,
    @Body() body: WebsiteClassifyDto,
    @User('_id') user: string,
  ) {
    return this.classifyService.updateClassify(id, body, user);
  }

  @Delete('/:id')
  @ApiOperation({ description: '删除分类' })
  @ApiResponse({ status: 200, type: WebsiteClassify })
  deleteClassify(@Param('id') id: string) {
    return this.classifyService.deleteClassify(id);
  }

  @Get('/:id')
  @ApiOperation({ description: '分类详情' })
  @ApiResponse({ status: 200, type: WebsiteClassify })
  classifyInfo(@Param('id') id: string) {
    return this.classifyService.detail(id);
  }
}
