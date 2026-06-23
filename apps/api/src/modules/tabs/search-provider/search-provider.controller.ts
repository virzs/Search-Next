import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SearchProviderService } from './search-provider.service';
import { DefaultProvidersSeed } from './seeds/default-providers.seed';
import {
  CreateSearchProviderDto,
  UpdateSearchProviderDto,
  SearchProviderResponseDto,
} from './dto/search-provider.dto';
import { User } from '../../../public/decorator/route-user.decoratpr';

@ApiTags('搜索提供商管理')
@Controller('search-provider')
export class SearchProviderController {
  constructor(
    private readonly searchProviderService: SearchProviderService,
    private readonly defaultProvidersSeed: DefaultProvidersSeed,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建搜索提供商' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: SearchProviderResponseDto,
  })
  async createProvider(
    @Body() createDto: CreateSearchProviderDto,
    @User() user: any,
  ) {
    const provider = await this.searchProviderService.createProvider(
      createDto,
      user?.id,
    );
    return provider;
  }

  @Get()
  @ApiOperation({ summary: '获取所有搜索提供商' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [SearchProviderResponseDto],
  })
  async getAllProviders() {
    const providers = await this.searchProviderService.getAllProviders();
    return providers;
  }

  @Get('enabled')
  @ApiOperation({ summary: '获取启用的搜索提供商' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [SearchProviderResponseDto],
  })
  async getEnabledProviders() {
    const providers = await this.searchProviderService.getEnabledProviders();
    return providers;
  }

  @Get('default')
  @ApiOperation({ summary: '获取默认搜索提供商' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: SearchProviderResponseDto,
  })
  async getDefaultProvider() {
    const provider = await this.searchProviderService.getDefaultProvider();
    if (!provider) {
      throw new NotFoundException('未设置默认搜索提供商');
    }
    return provider;
  }

  @Get('stats')
  @ApiOperation({ summary: '获取提供商统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProviderStats() {
    const stats = await this.searchProviderService.getProviderStats();
    return stats;
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取搜索提供商' })
  @ApiParam({ name: 'id', description: '提供商ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: SearchProviderResponseDto,
  })
  async getProviderById(@Param('id') id: string) {
    const provider = await this.searchProviderService.getProviderById(id);
    if (!provider) {
      throw new NotFoundException('搜索提供商不存在');
    }
    return provider;
  }

  @Put(':id')
  @ApiOperation({ summary: '更新搜索提供商' })
  @ApiParam({ name: 'id', description: '提供商ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: SearchProviderResponseDto,
  })
  async updateProvider(
    @Param('id') id: string,
    @Body() updateDto: UpdateSearchProviderDto,
    @User() user: any,
  ) {
    const provider = await this.searchProviderService.updateProvider(
      id,
      updateDto,
      user?.id,
    );
    return provider;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除搜索提供商' })
  @ApiParam({ name: 'id', description: '提供商ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteProvider(@Param('id') id: string, @User() user: any) {
    await this.searchProviderService.deleteProvider(id, user?.id);
    return { message: '删除成功' };
  }

  @Put(':id/set-default')
  @ApiOperation({ summary: '设置默认搜索提供商' })
  @ApiParam({ name: 'id', description: '提供商ID' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setDefaultProvider(@Param('id') id: string, @User() user: any) {
    await this.searchProviderService.setDefaultProvider(id, user?.id);
    return { message: '设置默认提供商成功' };
  }

  @Post(':id/test')
  @ApiOperation({ summary: '测试搜索提供商连接' })
  @ApiParam({ name: 'id', description: '提供商ID' })
  @ApiResponse({ status: 200, description: '测试完成' })
  async testProvider(@Param('id') id: string) {
    const result = await this.searchProviderService.testProvider(id);
    return result;
  }

  @Get('name/:name')
  @ApiOperation({ summary: '根据名称获取搜索提供商' })
  @ApiParam({ name: 'name', description: '提供商名称' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: SearchProviderResponseDto,
  })
  async getProviderByName(@Param('name') name: string) {
    const provider = await this.searchProviderService.getProviderByName(name);
    if (!provider) {
      throw new NotFoundException('搜索提供商不存在');
    }
    return provider;
  }

  @Post('seed/init')
  @ApiOperation({ summary: '初始化默认搜索提供商配置' })
  @ApiResponse({ status: 200, description: '初始化成功' })
  async initDefaultProviders() {
    await this.defaultProvidersSeed.seedDefaultProviders();
    return { message: '默认搜索提供商初始化成功' };
  }

  @Post('seed/reset')
  @ApiOperation({ summary: '重置所有搜索提供商配置' })
  @ApiResponse({ status: 200, description: '重置成功' })
  async resetProviders() {
    await this.defaultProvidersSeed.resetProviders();
    return { message: '搜索提供商配置重置成功' };
  }
}
