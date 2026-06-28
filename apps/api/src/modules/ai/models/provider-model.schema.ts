import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import BaseSchema, { baseSchemaMiddleware } from 'src/public/schema/base.schema';
import { AiProviderName } from '../provider/provider.schema';
import { AiModelName } from './ai-model.schema';

export const ProviderModelName = 'ProviderModel';

export type ProviderModelDocument = ProviderModel & Document;

@Schema({ timestamps: true })
export class ProviderModel extends BaseSchema {
  @Prop({ required: true, type: Types.ObjectId, ref: AiModelName })
  publicModel: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AiProviderName })
  provider: Types.ObjectId;

  @Prop({ required: true, type: String })
  upstreamModel: string;

  @Prop({ default: 100, type: Number })
  priority: number;

  @Prop({ default: true, type: Boolean })
  enabled: boolean;

  @Prop({ default: 'proxy', type: String })
  tag: 'official' | 'proxy';

  @Prop({ default: 0, type: Number })
  costInputPricePer1K: number;

  @Prop({ default: 0, type: Number })
  costOutputPricePer1K: number;

  @Prop({ default: 'manual', type: String })
  source?: 'manual' | 'synced';
}

export const ProviderModelSchema = SchemaFactory.createForClass(ProviderModel);

ProviderModelSchema.index({ publicModel: 1, enabled: 1, priority: -1 });
ProviderModelSchema.index(
  { publicModel: 1, provider: 1, upstreamModel: 1 },
  { unique: true },
);

baseSchemaMiddleware(ProviderModelSchema);
