import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import BaseSchema, { baseSchemaMiddleware } from 'src/public/schema/base.schema';

export const AiModelName = 'AiModel';

export type AiModelDocument = AiModel & Document;

@Schema({ timestamps: true })
export class AiModel extends BaseSchema {
  @Prop({ required: true, unique: true, type: String })
  name: string;

  @Prop({ required: false, unique: true, sparse: true, type: String })
  publicName?: string;

  @Prop({ required: true, type: String })
  displayName: string;

  @Prop({ default: 0, type: Number })
  contextWindow: number;

  @Prop({ default: 0, type: Number })
  inputPricePer1K: number;

  @Prop({ default: 0, type: Number })
  outputPricePer1K: number;

  @Prop({ default: true, type: Boolean })
  enabled: boolean;

  @Prop({ type: String })
  description?: string;

  @Prop({ default: 'manual', type: String })
  source?: 'manual' | 'synced';
}

export const AiModelSchema = SchemaFactory.createForClass(AiModel);

baseSchemaMiddleware(AiModelSchema);
