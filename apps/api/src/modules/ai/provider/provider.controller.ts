import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProviderService } from './provider.service';
import { AiProvider } from './provider.schema';
import { CreateProviderDto, ProviderModelDto, UpdateProviderDto, UpdateProviderModelDto } from './dto/provider.dto';
import { User } from 'src/public/decorator/route-user.decoratpr';

@ApiTags('AI/服务商管理')
@Controller('ai/providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  @ApiOperation({ summary: '创建AI服务商' })
  @ApiResponse({ status: 201, description: '服务商创建成功' })
  async createProvider(
    @Body() createProviderDto: CreateProviderDto,
    @User('_id') userId: string,
  ): Promise<AiProvider> {
    return this.providerService.createProvider(createProviderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: '获取所有AI服务商' })
  @ApiResponse({ status: 200, description: '服务商列表' })
  async getAllProviders(@Query() query: any) {
    return this.providerService.getAllProviders(query);
  }

  @Get('available')
  @ApiOperation({ summary: '获取可用的AI服务商列表' })
  @ApiResponse({ status: 200, description: '可用服务商列表' })
  async getAvailableProviders(): Promise<AiProvider[]> {
    return this.providerService.getAvailableProviders();
  }

  @Get('options')
  @ApiOperation({ summary: '获取AI服务商选项' })
  async getProviderOptions(): Promise<AiProvider[]> {
    return this.providerService.getProviderOptions();
  }

  @Post(':id/test')
  @ApiOperation({ summary: '测试AI服务商连接' })
  async testProvider(@Param('id') id: string, @Body() body: UpdateProviderDto) {
    return this.providerService.test(id, body);
  }

  @Post(':id/models/sync')
  @ApiOperation({ summary: '同步服务商上游模型' })
  async syncProviderModels(
    @Param('id') id: string,
    @Body() body: UpdateProviderDto,
    @User('_id') userId: string,
  ) {
    return this.providerService.syncModels(id, userId, body);
  }

  @Get(':id/models')
  @ApiOperation({ summary: '服务商模型列表' })
  async getProviderModels(@Param('id') id: string) {
    return this.providerService.listProviderModels(id);
  }

  @Post(':id/models')
  @ApiOperation({ summary: '新增服务商模型' })
  async createProviderModel(
    @Param('id') id: string,
    @Body() body: ProviderModelDto,
    @User('_id') userId: string,
  ) {
    return this.providerService.createProviderModel(id, body, userId);
  }

  @Put(':id/models/:providerModelId')
  @ApiOperation({ summary: '更新服务商模型' })
  async updateProviderModel(
    @Param('id') id: string,
    @Param('providerModelId') providerModelId: string,
    @Body() body: UpdateProviderModelDto,
    @User('_id') userId: string,
  ) {
    return this.providerService.updateProviderModel(id, providerModelId, body, userId);
  }

  @Delete(':id/models/:providerModelId')
  @ApiOperation({ summary: '删除服务商模型' })
  async deleteProviderModel(
    @Param('id') id: string,
    @Param('providerModelId') providerModelId: string,
  ) {
    return this.providerService.deleteProviderModel(id, providerModelId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取AI服务商详情' })
  @ApiResponse({ status: 200, description: '服务商详情' })
  async getProviderById(@Param('id') id: string): Promise<AiProvider> {
    return this.providerService.getProviderById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新AI服务商' })
  @ApiResponse({ status: 200, description: '服务商更新成功' })
  async updateProvider(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @User('_id') userId: string,
  ): Promise<AiProvider> {
    return this.providerService.updateProvider(id, updateProviderDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除AI服务商' })
  @ApiResponse({ status: 200, description: '服务商删除成功' })
  async deleteProvider(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.providerService.deleteProvider(id);
    return { success };
  }
}
