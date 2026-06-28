import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import BaseSchema, { baseSchemaMiddleware } from 'src/public/schema/base.schema';
import { AiModelName } from '../models/ai-model.schema';
import { UsersName } from 'src/modules/users/schemas/ref-names';

export const ConsumerKeyName = 'ConsumerKey';

export type ConsumerKeyDocument = ConsumerKey & Document;

@Schema({ timestamps: true })
export class ConsumerKey extends BaseSchema {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, unique: true, type: String })
  keyHash: string;

  @Prop({ required: true, type: String })
  keyPreview: string;

  @Prop({ type: Types.ObjectId, ref: UsersName })
  ownerUser?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: AiModelName, default: [] })
  allowedModels: Types.ObjectId[];

  @Prop({ default: true, type: Boolean })
  enabled: boolean;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ default: 0, type: Number })
  usageCount: number;

  @Prop({ type: Date })
  lastUsedAt?: Date;

  @Prop({ type: String })
  description?: string;
}

export const ConsumerKeySchema = SchemaFactory.createForClass(ConsumerKey);

ConsumerKeySchema.index({ enabled: 1, expiresAt: 1 });

baseSchemaMiddleware(ConsumerKeySchema);
