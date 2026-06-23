import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

export const AiSearchRecordName = 'AiSearchRecord';

export type AiSearchRecordDocument = AiSearchRecord & Document;

@Schema({ timestamps: true })
export class AiSearchRecord extends BaseSchema {
  @Prop({ required: true, type: String })
  query: string; // 搜索查询

  @Prop({ required: true, type: String })
  language: string; // 搜索语言

  @Prop({ required: true, type: String })
  country: string; // 搜索国家

  @Prop({ required: true, type: Number })
  pageNumber: number; // 页码

  @Prop({ required: true, type: Number })
  resultsCount: number; // 结果数量

  @Prop({ required: true, type: Object })
  searchResults: Record<string, any>; // 第三方搜索API返回的完整数据

  @Prop({ required: true, type: String })
  aiAnalysis: string; // AI分析结果

  @Prop({ required: true, type: String })
  aiProvider: string; // 使用的AI服务商

  @Prop({ required: true, type: String })
  aiModel: string; // 使用的AI模型

  @Prop({ required: true, type: Number })
  tokensUsed: number; // AI调用消耗的token数量

  @Prop({ required: true, type: Number })
  responseTime: number; // 总响应时间（毫秒）

  @Prop({ required: true, type: String, enum: ['success', 'error'] })
  status: string; // 处理状态

  @Prop({ type: String })
  errorMessage?: string; // 错误信息（如果有）
}

export const AiSearchRecordSchema = SchemaFactory.createForClass(AiSearchRecord);

baseSchemaMiddleware(AiSearchRecordSchema);