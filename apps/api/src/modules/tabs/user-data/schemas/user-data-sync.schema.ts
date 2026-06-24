import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from '../../../../public/schema/base.schema';
import { UsersName } from '../../../users/schemas/ref-names';

export type UserDataSyncDocument = UserDataSync & Document;

export const UserDataSyncName = 'UserDataSync';

const UserDataPluginSummarySchema = new mongoose.Schema(
  {
    widgetId: { type: String, required: true },
    name: { type: String },
    version: { type: String },
    count: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

@Schema({ timestamps: true })
export class UserDataSync extends BaseSchema {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: UsersName,
    index: true,
  })
  userId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  payload: Record<string, any>;

  @Prop({ type: Number, default: 0 })
  byteSize: number;

  @Prop({ type: Number, default: 0 })
  itemCount: number;

  @Prop({ type: [UserDataPluginSummarySchema], default: [] })
  pluginSummary: Array<{
    widgetId: string;
    name?: string;
    version?: string;
    count: number;
  }>;

  @Prop({ type: Date, required: true })
  lastSyncedAt: Date;
}

export const UserDataSyncSchema = SchemaFactory.createForClass(UserDataSync);

UserDataSyncSchema.index({ userId: 1, lastSyncedAt: -1 });

baseSchemaMiddleware(UserDataSyncSchema);
