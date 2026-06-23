import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

export type AiPresetDocument = AiPreset & Document;

export const AiPresetName = 'AiPreset';

@Schema({ timestamps: true })
export class AiPreset extends BaseSchema {
  @Prop({ required: true })
  name: string; // 配置名称

  @Prop({ required: true })
  systemPrompt: string; // 系统提示词

  @Prop()
  userPrompt?: string; // 用户提示词模板

  @Prop({ default: 0.7, min: 0, max: 2 })
  temperature: number; // 模型温度

  @Prop({ default: 4096, min: 1 })
  maxTokens: number; // 最大token数

  @Prop({ default: 8192, min: 1 })
  maxContext: number; // 最大上下文长度

  @Prop({ default: false })
  stream: boolean; // 是否流式输出

  @Prop({ type: Object, default: {} })
  config: Record<string, any>; // 额外配置参数

  @Prop({ default: true })
  enabled: boolean; // 是否启用

  @Prop()
  description?: string; // 描述信息

  @Prop({ type: [String], default: [] })
  tags: string[]; // 标签
}

export const AiPresetSchema = SchemaFactory.createForClass(AiPreset);

baseSchemaMiddleware(AiPresetSchema);
