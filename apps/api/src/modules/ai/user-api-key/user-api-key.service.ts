import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserApiKey,
  UserApiKeyDocument,
  UserApiKeyName,
} from './user-api-key.schema';

@Injectable()
export class UserApiKeyService {
  constructor(
    @InjectModel(UserApiKeyName)
    private userApiKeyModel: Model<UserApiKeyDocument>,
  ) {}

  /**
   * 保存用户API密钥
   */
  async saveApiKey(
    creator: string,
    provider: string,
    apiKey: string,
  ): Promise<UserApiKey> {
    const existingKey = await this.userApiKeyModel
      .findOne({ creator, provider })
      .exec();

    if (existingKey) {
      throw new BadRequestException(
        '该服务商的API密钥已存在，每个服务商只能创建一个API密钥',
      );
    }

    return this.userApiKeyModel.create({
      creator,
      provider,
      apiKey,
    });
  }

  /**
   * 获取用户的所有API密钥
   */
  async getUserApiKeys(creator: string): Promise<any[]> {
    const apiKeys = await this.userApiKeyModel
      .find({ creator })
      .populate('provider', 'name displayName')
      .exec();

    // 对API密钥进行加密处理，显示前4位和后4位，中间用*替代
    return apiKeys.map((key) => {
      const maskedApiKey = this.maskApiKey(key.apiKey);
      return {
        ...key.toObject(),
        apiKey: maskedApiKey,
      };
    });
  }

  /**
   * 对API密钥进行加密处理
   */
  private maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length <= 8) {
      return '*'.repeat(apiKey?.length || 0);
    }

    const start = apiKey.substring(0, 4);
    const end = apiKey.substring(apiKey.length - 4);
    const middle = '*'.repeat(apiKey.length - 8);

    return `${start}${middle}${end}`;
  }

  /**
   * 获取用户指定服务商的API密钥
   */
  async getUserApiKey(
    creator: string,
    provider: string,
  ): Promise<UserApiKey | null> {
    return this.userApiKeyModel.findOne({ creator, provider }).exec();
  }

  /**
   * 删除用户API密钥
   */
  async deleteApiKey(creator: string, provider: string): Promise<boolean> {
    const result = await this.userApiKeyModel
      .deleteOne({ creator, provider })
      .exec();
    return result.deletedCount > 0;
  }

  /**
   * 更新API密钥使用统计
   */
  async updateApiKeyUsage(creator: string, provider: string): Promise<void> {
    await this.userApiKeyModel
      .updateOne(
        { creator, provider },
        {
          $inc: { usageCount: 1 },
          $set: { lastUsedAt: new Date() },
        },
      )
      .exec();
  }

  /**
   * 检查用户是否有指定服务商的API密钥
   */
  async hasApiKey(creator: string, provider: string): Promise<boolean> {
    const count = await this.userApiKeyModel
      .countDocuments({ creator, provider })
      .exec();
    return count > 0;
  }

  /**
   * 获取用户API密钥的实际值（用于内部调用）
   */
  async getApiKeyValue(
    creator: string,
    provider: string,
  ): Promise<string | null> {
    const userApiKey = await this.userApiKeyModel
      .findOne({ creator, provider })
      .exec();
    return userApiKey?.apiKey || null;
  }
}
