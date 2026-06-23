import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

export type SearchProviderDocument = SearchProvider & Document;

export const SearchProviderName = 'SearchProvider';

// 搜索提供商配置接口
export interface SearchProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxResults?: number;
  defaultCountry?: string;
  defaultLanguage?: string;
  customHeaders?: Record<string, string>;
  customParams?: Record<string, any>;
}

@Schema({ timestamps: true })
export class SearchProvider extends BaseSchema {
  @Prop({ required: true, unique: true })
  name: string; // 提供商名称，如 'serper', 'bing', 'google'

  @Prop({ required: true })
  displayName: string; // 显示名称

  @Prop()
  description?: string; // 描述

  @Prop({ required: true })
  apiEndpoint: string; // API端点URL

  @Prop({ type: Object, default: {} })
  config: SearchProviderConfig; // 配置信息

  @Prop({ default: true })
  isEnabled: boolean; // 是否启用

  @Prop({ default: false })
  isDefault: boolean; // 是否为默认提供商

  @Prop({ default: 0 })
  priority: number; // 优先级，数字越大优先级越高

  @Prop()
  lastUsedAt?: Date; // 最后使用时间

  @Prop({ default: 0 })
  usageCount: number; // 使用次数

  @Prop({ default: 0 })
  successCount: number; // 成功次数

  @Prop({ default: 0 })
  errorCount: number; // 错误次数
}

export const SearchProviderSchema =
  SchemaFactory.createForClass(SearchProvider);

// 应用基础中间件
baseSchemaMiddleware(SearchProviderSchema);

// 确保只有一个默认提供商
SearchProviderSchema.pre('save', async function (next) {
  if (this.isDefault) {
    // 如果设置为默认，将其他提供商的默认状态设为false
    await (this.constructor as any).updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false },
    );
  }
  next();
});
