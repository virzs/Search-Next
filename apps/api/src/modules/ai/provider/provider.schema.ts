import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

export const AiProviderName = 'AiProvider';

export type AiProviderDocument = AiProvider & Document;

@Schema({ timestamps: true })
export class AiProvider extends BaseSchema {
  @Prop({ required: true, unique: true, type: String })
  name: string; // 服务商标识，如 openai, azure, anthropic

  @Prop({ required: true, type: String })
  displayName: string; // 显示名称，如 OpenAI, Azure OpenAI

  @Prop({ required: true, type: String })
  baseUrl: string; // API基础地址

  @Prop({ type: String })
  apiKey?: string; // 全局API密钥（可选）

  @Prop({ required: true, type: String })
  defaultModel: string; // 默认模型

  @Prop({ default: true, type: Boolean })
  enabled: boolean; // 是否启用

  @Prop({ type: [String], default: [] })
  supportedModels: string[]; // 支持的模型列表

  @Prop({ type: String })
  description?: string; // 描述信息
}

export const AiProviderSchema = SchemaFactory.createForClass(AiProvider);

baseSchemaMiddleware(AiProviderSchema);
