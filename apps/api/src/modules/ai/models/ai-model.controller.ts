import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { AiModelService } from './ai-model.service';
import { CreateAiModelDto, UpdateAiModelDto } from './dto/ai-model.dto';

@ApiTags('AI/模型管理')
@Controller('ai/models')
export class AiModelController {
  constructor(private readonly aiModelService: AiModelService) {}

  @Get()
  @ApiOperation({ summary: '模型列表' })
  page(@Query() query: any): Promise<any> {
    return this.aiModelService.page(query);
  }

  @Get('options')
  @ApiOperation({ summary: '可用模型选项' })
  options(@Query() query: any): Promise<any[]> {
    return this.aiModelService.options(query?.includeDisabled === 'true' || query?.includeDisabled === true);
  }

  @Get(':id')
  @ApiOperation({ summary: '模型详情' })
  detail(@Param('id') id: string): Promise<any> {
    return this.aiModelService.detail(id);
  }

  @Post()
  @ApiOperation({ summary: '创建模型' })
  create(@Body() body: CreateAiModelDto, @User('_id') userId: string): Promise<any> {
    return this.aiModelService.create(body, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新模型' })
  update(@Param('id') id: string, @Body() body: UpdateAiModelDto, @User('_id') userId: string): Promise<any> {
    return this.aiModelService.update(id, body, userId);
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: '切换模型启用状态' })
  toggle(@Param('id') id: string, @User('_id') userId: string): Promise<any> {
    return this.aiModelService.toggle(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除模型' })
  remove(@Param('id') id: string): Promise<any> {
    return this.aiModelService.remove(id);
  }
}
