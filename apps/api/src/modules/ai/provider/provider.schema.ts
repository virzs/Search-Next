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
  name: string;

  @Prop({ required: true, type: String })
  displayName: string;

  @Prop({ default: 'openai-compatible', type: String })
  type: string;

  @Prop({ default: true, type: Boolean })
  enabled: boolean;

  @Prop({ type: String })
  description?: string;

  @Prop({ required: false, type: String })
  baseUrl?: string;

  @Prop({ type: String })
  encryptedApiKey?: string;

  @Prop({ type: String })
  apiKeyPreview?: string;

  @Prop({ type: String })
  testModel?: string;

  @Prop({ default: 100, type: Number })
  priority: number;

  @Prop({ default: 60000, type: Number })
  timeoutMs: number;

  @Prop({ type: Date })
  lastTestedAt?: Date;

  @Prop({ type: String })
  lastTestStatus?: string;

  @Prop({ type: String })
  lastTestMessage?: string;

}

export const AiProviderSchema = SchemaFactory.createForClass(AiProvider);

baseSchemaMiddleware(AiProviderSchema);
