import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserApiKeyDocument,
  UserApiKeyName,
} from '../user-api-key/user-api-key.schema';
import {
  AiProvider,
  AiProviderDocument,
  AiProviderName,
} from './provider.schema';

@Injectable()
export class ProviderService {
  constructor(
    @InjectModel(AiProviderName)
    private aiProviderModel: Model<AiProviderDocument>,
    @InjectModel(UserApiKeyName)
    private userApiKeyModel: Model<UserApiKeyDocument>,
  ) {}

  /**
   * 创建AI服务商
   */
  async createProvider(
    providerData: Partial<AiProvider>,
    userId: string,
  ): Promise<AiProvider> {
    // 检查服务商名称是否已存在
    const existingProvider = await this.aiProviderModel
      .findOne({ name: providerData.name })
      .exec();
    if (existingProvider) {
      throw new BadRequestException('服务商名称已存在');
    }

    return this.aiProviderModel.create({
      ...providerData,
      creator: userId,
    });
  }

  /**
   * 更新AI服务商
   */
  async updateProvider(
    providerId: string,
    updateData: Partial<AiProvider>,
    userId: string,
  ): Promise<AiProvider> {
    const provider = await this.aiProviderModel.findById(providerId).exec();
    if (!provider) {
      throw new NotFoundException('服务商不存在');
    }

    // 如果更新名称，检查是否重复
    if (updateData.name && updateData.name !== provider.name) {
      const existingProvider = await this.aiProviderModel
        .findOne({ name: updateData.name })
        .exec();
      if (existingProvider) {
        throw new BadRequestException('服务商名称已存在');
      }
    }

    Object.assign(provider, updateData);
    provider.updatedAt = new Date();
    provider.updater = userId;
    return provider.save();
  }

  /**
   * 删除AI服务商
   */
  async deleteProvider(providerId: string): Promise<boolean> {
    const provider = await this.aiProviderModel.findById(providerId).exec();
    if (!provider) {
      throw new NotFoundException('服务商不存在');
    }

    // 检查是否有用户在使用该服务商
    const userApiKeysCount = await this.userApiKeyModel
      .countDocuments({ provider: provider.name })
      .exec();
    if (userApiKeysCount > 0) {
      throw new BadRequestException('该服务商正在被用户使用，无法删除');
    }

    const result = await this.aiProviderModel
      .deleteOne({ _id: providerId })
      .exec();
    return result.deletedCount > 0;
  }

  /**
   * 获取AI服务商详情
   */
  async getProviderById(providerId: string): Promise<AiProvider> {
    const provider = await this.aiProviderModel.findById(providerId).exec();
    if (!provider) {
      throw new NotFoundException('服务商不存在');
    }
    return provider;
  }

  /**
   * 获取所有AI服务商（包括禁用的）
   */
  async getAllProviders(): Promise<AiProvider[]> {
    return this.aiProviderModel
      .find()
      .populate('creator')
      .populate('updater')
      .exec();
  }

  /**
   * 获取可用的AI服务商列表
   */
  async getAvailableProviders(): Promise<AiProvider[]> {
    return this.aiProviderModel
      .find(
        { enabled: true },
        {
          _id: 1,
          name: 1,
          displayName: 1,
          description: 1,
          apiBaseUrl: 1,
          defaultModel: 1,
          supportedModels: 1,
        },
      )
      .exec();
  }

  /**
   * 根据名称获取服务商
   */
  async getProviderByName(name: string): Promise<AiProvider | null> {
    return this.aiProviderModel.findOne({ name, enabled: true }).exec();
  }
}
