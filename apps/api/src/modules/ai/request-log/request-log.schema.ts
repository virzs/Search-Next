import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import BaseSchema, { baseSchemaMiddleware } from 'src/public/schema/base.schema';
import { ConsumerKeyName } from '../consumer-key/consumer-key.schema';
import { AiModelName } from '../models/ai-model.schema';
import { ProviderModelName } from '../models/provider-model.schema';
import { AiProviderName } from '../provider/provider.schema';
import { UsersName } from 'src/modules/users/schemas/ref-names';

export const AiRequestLogName = 'AiRequestLog';

export type AiRequestLogDocument = AiRequestLog & Document;

@Schema({ timestamps: true })
export class AiRequestLog extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: ConsumerKeyName })
  consumerKey?: Types.ObjectId;

  @Prop({ type: String })
  consumerKeyPreview?: string;

  @Prop({ type: Types.ObjectId, ref: UsersName })
  ownerUser?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: AiModelName })
  aiModel?: Types.ObjectId;

  @Prop({ type: String })
  modelName?: string;

  @Prop({ type: Types.ObjectId, ref: ProviderModelName })
  providerModel?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: AiProviderName })
  provider?: Types.ObjectId;

  @Prop({ type: String })
  upstreamModel?: string;

  @Prop({ required: true, type: String })
  status: 'success' | 'error';

  @Prop({ default: false, type: Boolean })
  stream: boolean;

  @Prop({ type: Number })
  promptTokens?: number;

  @Prop({ type: Number })
  completionTokens?: number;

  @Prop({ type: Number })
  totalTokens?: number;

  @Prop({ default: 0, type: Number })
  estimatedCost: number;

  @Prop({ default: 0, type: Number })
  chargedIntegral: number;

  @Prop({ default: 0, type: Number })
  upstreamCost: number;

  @Prop({ type: Number })
  balanceBefore?: number;

  @Prop({ type: Number })
  balanceAfter?: number;

  @Prop({ default: 'not_charged', type: String })
  billingStatus: 'charged' | 'no_usage' | 'not_charged' | 'failed';

  @Prop({ default: false, type: Boolean })
  isFallback: boolean;

  @Prop({ default: 0, type: Number })
  fallbackIndex: number;

  @Prop({ type: Number })
  latencyMs?: number;

  @Prop({ type: Number })
  upstreamStatus?: number;

  @Prop({ type: String })
  errorMessage?: string;
}

export const AiRequestLogSchema = SchemaFactory.createForClass(AiRequestLog);

AiRequestLogSchema.index({ createdAt: -1 });
AiRequestLogSchema.index({ consumerKey: 1, createdAt: -1 });
AiRequestLogSchema.index({ ownerUser: 1, createdAt: -1 });
AiRequestLogSchema.index({ modelName: 1, createdAt: -1 });
AiRequestLogSchema.index({ status: 1, createdAt: -1 });

baseSchemaMiddleware(AiRequestLogSchema);
