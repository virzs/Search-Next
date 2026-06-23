import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAiPresetDto, UpdateAiPresetDto } from './dto/ai-preset.dto';
import { AiPreset } from './preset.schema';
import { AiPresetService } from './preset.service';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { PageDto } from 'src/public/dto/page';
import { Response } from 'src/utils/response';

@ApiTags('AI/配置管理')
@Controller('ai/preset')
export class AiPresetController {
  constructor(private readonly aiPresetService: AiPresetService) {}

  @Post()
  @ApiOperation({ summary: '创建AI配置' })
  @ApiResponse({ status: 201, description: '创建成功', type: AiPreset })
  async create(
    @Body() createPresetDto: CreateAiPresetDto,
    @User('_id') userId: string,
  ): Promise<AiPreset> {
    return this.aiPresetService.create(createPresetDto, userId);
  }

  @Get()
  @ApiOperation({ summary: '获取AI配置列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: PageDto & any) {
    const { data, total } = await this.aiPresetService.findAll(query);
    return Response.page(data, { ...query, total });
  }

  @Get('list')
  @ApiOperation({ summary: '获取AI配置简单列表（不分页）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findSimpleList(): Promise<{ _id: string; name: string }[]> {
    return this.aiPresetService.findSimpleList();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取AI配置详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: AiPreset })
  async findOne(@Param('id') id: string): Promise<AiPreset> {
    return this.aiPresetService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新AI配置' })
  @ApiResponse({ status: 200, description: '更新成功', type: AiPreset })
  async update(
    @Param('id') id: string,
    @Body() updatePresetDto: UpdateAiPresetDto,
    @User('_id') userId: string,
  ): Promise<AiPreset> {
    return this.aiPresetService.update(id, updatePresetDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除AI配置' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.aiPresetService.remove(id);
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: '切换AI配置启用状态' })
  @ApiResponse({ status: 200, description: '切换成功', type: AiPreset })
  async toggleEnabled(@Param('id') id: string): Promise<AiPreset> {
    return this.aiPresetService.toggleEnabled(id);
  }
}
