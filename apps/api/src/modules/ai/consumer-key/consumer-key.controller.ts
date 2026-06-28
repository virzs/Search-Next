import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { ConsumerKeyService } from './consumer-key.service';
import { CreateConsumerKeyDto, UpdateConsumerKeyDto } from './dto/consumer-key.dto';

@ApiTags('AI/API Key 管理')
@Controller('ai/consumer-keys')
export class ConsumerKeyController {
  constructor(private readonly consumerKeyService: ConsumerKeyService) {}

  @Get()
  @ApiOperation({ summary: 'API Key 列表' })
  page(@Query() query: any): Promise<any> {
    return this.consumerKeyService.page(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'API Key 详情' })
  detail(@Param('id') id: string): Promise<any> {
    return this.consumerKeyService.detail(id);
  }

  @Post()
  @ApiOperation({ summary: '创建 API Key' })
  create(@Body() body: CreateConsumerKeyDto, @User('_id') userId: string): Promise<any> {
    return this.consumerKeyService.create(body, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新 API Key' })
  update(@Param('id') id: string, @Body() body: UpdateConsumerKeyDto, @User('_id') userId: string): Promise<any> {
    return this.consumerKeyService.update(id, body, userId);
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: '切换 API Key 状态' })
  toggle(@Param('id') id: string, @User('_id') userId: string): Promise<any> {
    return this.consumerKeyService.toggle(id, userId);
  }

  @Post(':id/reset')
  @ApiOperation({ summary: '重置 API Key' })
  reset(@Param('id') id: string, @User('_id') userId: string): Promise<any> {
    return this.consumerKeyService.reset(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除 API Key' })
  remove(@Param('id') id: string): Promise<any> {
    return this.consumerKeyService.remove(id);
  }
}
