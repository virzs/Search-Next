import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { AiProviderName } from '../provider/provider.schema';

export type UserApiKeyDocument = UserApiKey & Document;

export const UserApiKeyName = 'UserApiKey';

@Schema({ timestamps: true })
export class UserApiKey extends BaseSchema {
  @Prop({ required: true, type: Types.ObjectId, ref: AiProviderName })
  provider: Types.ObjectId;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 0 })
  usageCount: number; // 使用次数统计

  @Prop()
  lastUsedAt?: Date; // 最后使用时间

  @Prop()
  description?: string; // 描述信息
}

export const UserApiKeySchema = SchemaFactory.createForClass(UserApiKey);

baseSchemaMiddleware(UserApiKeySchema);
