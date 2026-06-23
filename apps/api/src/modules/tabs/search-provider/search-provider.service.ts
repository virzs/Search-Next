import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SearchProvider,
  SearchProviderDocument,
  SearchProviderName,
} from './schemas/search-provider.schema';
import {
  CreateSearchProviderDto,
  UpdateSearchProviderDto,
} from './dto/search-provider.dto';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class SearchProviderService {
  private readonly logger = new Logger(SearchProviderService.name);
  constructor(
    @InjectModel(SearchProviderName)
    private searchProviderModel: Model<SearchProviderDocument>,
  ) {}

  /**
   * 创建搜索提供商
   */
  async createProvider(
    createDto: CreateSearchProviderDto,
    userId?: string,
  ): Promise<SearchProviderDocument> {
    // 检查名称是否已存在
    const existingProvider = await this.searchProviderModel.findOne({
      name: createDto.name,
    });
    if (existingProvider) {
      this.logger.warn(`Provider name exists: name=${createDto.name}`);
      throw new BadRequestException('提供商名称已存在');
    }

    // 如果设置为默认提供商，先取消其他默认设置
    if (createDto.isDefault) {
      await this.searchProviderModel.updateMany({}, { isDefault: false });
    }

    const provider = new this.searchProviderModel({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return await provider.save();
  }

  /**
   * 获取所有搜索提供商
   */
  async getAllProviders(): Promise<SearchProvider[]> {
    return await this.searchProviderModel
      .find()
      .sort({ priority: -1, createdAt: -1 })
      .exec();
  }

  /**
   * 获取启用的搜索提供商
   */
  async getEnabledProviders(): Promise<SearchProvider[]> {
    return await this.searchProviderModel
      .find({ isEnabled: true })
      .sort({ priority: -1, createdAt: -1 })
      .exec();
  }

  /**
   * 根据名称获取提供商
   */
  async getProviderByName(name: string): Promise<SearchProvider | null> {
    return await this.searchProviderModel.findOne({ name }).exec();
  }

  /**
   * 根据ID获取提供商
   */
  async getProviderById(id: string): Promise<SearchProvider | null> {
    return await this.searchProviderModel.findById(id).exec();
  }

  /**
   * 获取默认搜索提供商
   */
  async getDefaultProvider(): Promise<SearchProvider | null> {
    return await this.searchProviderModel
      .findOne({ isDefault: true, isEnabled: true })
      .exec();
  }

  /**
   * 更新搜索提供商
   */
  async updateProvider(
    id: string,
    updateDto: UpdateSearchProviderDto,
    userId?: string,
  ): Promise<SearchProviderDocument> {
    const provider = await this.searchProviderModel.findById(id);
    if (!provider) {
      throw new NotFoundException('搜索提供商不存在');
    }

    // 如果设置为默认提供商，先取消其他默认设置
    if (updateDto.isDefault) {
      await this.searchProviderModel.updateMany(
        { _id: { $ne: id } },
        { isDefault: false },
      );
    }

    Object.assign(provider, updateDto, { updatedBy: userId });
    return await provider.save();
  }

  /**
   * 删除搜索提供商
   */
  async deleteProvider(id: string, userId?: string): Promise<void> {
    const provider = await this.searchProviderModel.findById(id);
    if (!provider) {
      throw new NotFoundException('搜索提供商不存在');
    }

    // 如果删除的是默认提供商，需要设置其他提供商为默认
    if (provider.isDefault) {
      const otherProvider = await this.searchProviderModel
        .findOne({ _id: { $ne: id }, isEnabled: true })
        .sort({ priority: -1 })
        .exec();

      if (otherProvider) {
        otherProvider.isDefault = true;
        await otherProvider.save();
      }
    }

    provider.isDelete = true;
    provider.updater = userId;
    await provider.save();
  }

  /**
   * 设置默认提供商
   */
  async setDefaultProvider(providerId: string, userId?: string): Promise<void> {
    const provider = await this.searchProviderModel.findById(providerId);
    if (!provider) {
      throw new NotFoundException('搜索提供商不存在');
    }

    if (!provider.isEnabled) {
      this.logger.warn(`Provider disabled: id=${providerId}`);
      throw new BadRequestException('无法设置已禁用的提供商为默认');
    }

    // 取消所有默认设置
    await this.searchProviderModel.updateMany({}, { isDefault: false });

    // 设置新的默认提供商
    provider.isDefault = true;
    provider.updater = userId;
    await provider.save();
  }

  /**
   * 调用搜索API
   */
  async callSearchApi(providerName: string, searchParams: any): Promise<any> {
    const provider = await this.getProviderByName(providerName);
    if (!provider) {
      throw new NotFoundException(`搜索提供商 ${providerName} 不存在`);
    }

    if (!provider.isEnabled) {
      this.logger.warn(`Provider disabled: name=${providerName}`);
      throw new BadRequestException(`搜索提供商 ${providerName} 已禁用`);
    }

    const config = provider.config || {};
    const requestConfig: AxiosRequestConfig = {
      method: 'POST',
      url: provider.apiEndpoint,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.customHeaders,
      },
    };

    // 构建请求数据
    const requestData = {
      ...searchParams,
      ...config.customParams,
    };

    // 添加API密钥
    if (config.apiKey) {
      requestConfig.headers['X-API-KEY'] = config.apiKey;
    }

    try {
      const startTime = Date.now();
      const response = await axios(requestConfig.url, {
        ...requestConfig,
        data: requestData,
      });
      const responseTime = Date.now() - startTime;

      // 更新使用统计
      await this.updateUsageStats(
        (provider as any)._id.toString(),
        true,
        responseTime,
      );

      return response.data;
    } catch (error) {
      // 更新错误统计
      await this.updateUsageStats((provider as any)._id.toString(), false);
      throw error;
    }
  }

  /**
   * 获取可用的搜索提供商（用于搜索时选择）
   */
  async getAvailableProvider(
    preferredProvider?: string,
  ): Promise<SearchProvider> {
    let provider: SearchProvider | null = null;

    // 如果指定了提供商，优先使用
    if (preferredProvider) {
      provider = await this.getProviderByName(preferredProvider);
      if (provider && provider.isEnabled) {
        return provider;
      }
    }

    // 使用默认提供商
    provider = await this.getDefaultProvider();
    if (provider) {
      return provider;
    }

    // 如果没有默认提供商，使用第一个启用的提供商
    const enabledProviders = await this.getEnabledProviders();
    if (enabledProviders.length > 0) {
      return enabledProviders[0];
    }

    this.logger.warn('No available search provider');
    throw new BadRequestException('没有可用的搜索提供商');
  }

  /**
   * 更新使用统计
   */
  private async updateUsageStats(
    providerId: string,
    isSuccess: boolean,
    responseTime?: number,
  ): Promise<void> {
    const updateData: any = {
      $inc: {
        usageCount: 1,
        ...(isSuccess ? { successCount: 1 } : { errorCount: 1 }),
      },
      lastUsedAt: new Date(),
    };

    await this.searchProviderModel.findByIdAndUpdate(providerId, updateData);
  }

  /**
   * 测试提供商连接
   */
  async testProvider(providerId: string): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    const provider = await this.getProviderById(providerId);
    if (!provider) {
      throw new NotFoundException('搜索提供商不存在');
    }

    try {
      const startTime = Date.now();
      await this.callSearchApi(provider.name, {
        q: 'test',
        num: 1,
      });
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: '连接测试成功',
        responseTime,
      };
    } catch (error) {
      return {
        success: false,
        message: `连接测试失败: ${error.message}`,
      };
    }
  }

  /**
   * 获取提供商统计信息
   */
  async getProviderStats(): Promise<{
    total: number;
    enabled: number;
    disabled: number;
    totalUsage: number;
    totalSuccess: number;
    totalErrors: number;
  }> {
    const providers = await this.getAllProviders();

    return {
      total: providers.length,
      enabled: providers.filter((p) => p.isEnabled).length,
      disabled: providers.filter((p) => !p.isEnabled).length,
      totalUsage: providers.reduce((sum, p) => sum + p.usageCount, 0),
      totalSuccess: providers.reduce((sum, p) => sum + p.successCount, 0),
      totalErrors: providers.reduce((sum, p) => sum + p.errorCount, 0),
    };
  }
}
