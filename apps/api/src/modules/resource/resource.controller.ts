import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express/multer';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CompleteDirectUploadDto,
  CreateDirectUploadDto,
  GetVisitUrlsDto,
} from './dto/upload.dto';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';

@ApiTags('资源')
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  // 创建客户端直传任务
  @Post('/direct')
  @ApiOperation({ summary: '创建客户端直传任务' })
  @ApiBody({ type: CreateDirectUploadDto })
  async createDirectUpload(
    @Body() data: CreateDirectUploadDto,
    @User('_id') user: string,
  ) {
    return await this.resourceService.createDirectUpload(data, user);
  }

  // 完成客户端直传并登记资源
  @Post('/direct/complete')
  @ApiOperation({ summary: '完成客户端直传并登记资源' })
  @ApiBody({ type: CompleteDirectUploadDto })
  async completeDirectUpload(
    @Body() data: CompleteDirectUploadDto,
    @User('_id') user: string,
  ) {
    return await this.resourceService.completeDirectUpload(data, user);
  }

  // 上传文件
  @Post('/:dirs')
  @ApiOperation({ summary: '上传文件' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('dirs') dir: string,
    @UploadedFile() file: Express.Multer.File,
    @User('_id') user: string,
  ) {
    const result = await this.resourceService.uploadFile(dir, file, user);
    return result;
  }

  // 批量上传文件
  @Post('/batch/:dirs')
  @ApiOperation({ summary: '批量上传文件' })
  @ApiParam({ name: 'dirs', description: '目录', example: 'test' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files[]'))
  async uploadFiles(
    @Param('dirs') dir: string,
    @UploadedFiles() files: Express.Multer.File[],
    @User('_id') user: string,
  ) {
    console.log('🚀 ~ ResourceController ~ files:', files);
    const result = await this.resourceService.uploadFiles(dir, files, user);
    return result;
  }

  // 批量获取访问链接
  @Get('/urls')
  @ApiOperation({ summary: '批量获取访问链接' })
  async getVisitUrls(@Query() query: GetVisitUrlsDto) {
    const result = await this.resourceService.getVisitUrls(query.ids);
    return result;
  }

  // 获取访问链接
  @Get('/url/:id')
  @ApiOperation({ summary: '获取访问链接' })
  async getVisitUrl(@Param('id') id: string) {
    const result = await this.resourceService.getVisitUrl(id);
    return result;
  }

  // 资源详情
  @Get('/objects/:id')
  @ApiOperation({ summary: '资源详情' })
  async detail(@Param('id') id: string) {
    return await this.resourceService.getResourceDetail(id);
  }

  // 删除资源
  @Delete('/:id')
  @ApiOperation({ summary: '删除资源' })
  async delete(@Param('id') id: string) {
    return await this.resourceService.deleteFile(id);
  }

  // 删除资源，不可恢复
  @Delete('/recycle/:id')
  @ApiOperation({ summary: '删除资源，不可恢复' })
  async deletePermanent(@Param('id') id: string) {
    return await this.resourceService.deleteFilePermanent(id);
  }

  // 回收站 列表
  @Get('/recycle')
  @ApiOperation({ summary: '回收站列表' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  async recycle(@Query() query: PageDto) {
    return await this.resourceService.recycle(query);
  }

  // 回收站还原
  @Put('/recycle/restore/:id')
  @ApiOperation({ summary: '回收站还原' })
  async restore(@Param('id') id: string) {
    return await this.resourceService.restore(id);
  }

  // 列表
  @Get()
  @ApiOperation({ summary: '列表' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  async listAll(@Query() query: PageDto) {
    return await this.resourceService.list(query, undefined);
  }

  // 按服务筛选列表
  @Get('/:service')
  @ApiOperation({ summary: '列表（按服务）' })
  @ApiParam({ name: 'service', description: '服务标识', example: 'blog' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  async listByService(
    @Param('service') service: string,
    @Query() query: PageDto,
  ) {
    return await this.resourceService.list(query, service);
  }

  // 获取单个资源所有关联数据
  @Get('/association/:id')
  @ApiOperation({ summary: '获取单个资源所有关联数据' })
  async getAssociation(@Param('id') id: string) {
    return await this.resourceService.getAssociatedData(id);
  }
}
