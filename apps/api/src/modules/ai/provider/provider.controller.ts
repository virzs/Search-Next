import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProviderService } from './provider.service';
import { AiProvider } from './provider.schema';
import { CreateProviderDto, UpdateProviderDto } from './dto/provider.dto';
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
  async getAllProviders(): Promise<AiProvider[]> {
    return this.providerService.getAllProviders();
  }

  @Get('available')
  @ApiOperation({ summary: '获取可用的AI服务商列表' })
  @ApiResponse({ status: 200, description: '可用服务商列表' })
  async getAvailableProviders(): Promise<AiProvider[]> {
    return this.providerService.getAvailableProviders();
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
