import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { AppName } from './app.schema';

export type AppVersionDocument = AppVersion & Document;

export const AppVersionName = 'AppVersion';

const AppIconSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'custom'], required: true },
    src: { type: String },
  },
  { _id: false },
);

const AppScreenshotSchema = {
  mode: { type: String },
  themeId: { type: String, required: true },
  sizeId: { type: String, required: true },
  width: { type: Number },
  height: { type: Number },
  file: { type: String, required: true },
  url: { type: String, required: true },
};

@Schema({ timestamps: true })
export class AppVersion extends BaseSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: AppName, required: true })
  app: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  version: string;

  @Prop({ type: String, required: true })
  packageName: string;

  @Prop({ type: String, required: true })
  packageKey: string;

  @Prop({ type: String, required: true })
  packageUrl: string;

  @Prop({ type: String, required: true })
  entryFileName: string;

  @Prop({ type: String, required: true })
  entryUrl: string;

  @Prop({ type: String })
  iconUrl?: string;

  @Prop({ type: AppIconSchema })
  appIcon?: { type: 'image' | 'custom'; src?: string };

  @Prop({ type: String })
  appIconUrl?: string;

  @Prop({ type: [AppScreenshotSchema], default: [] })
  screenshots: Array<{
    mode?: string;
    themeId: string;
    sizeId: string;
    width?: number;
    height?: number;
    file: string;
    url: string;
  }>;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  configSnapshot: Record<string, unknown>;

  @Prop({ type: Boolean, default: false })
  active: boolean;
}

export const AppVersionSchema = SchemaFactory.createForClass(AppVersion);
AppVersionSchema.index({ app: 1, version: 1 });
baseSchemaMiddleware(AppVersionSchema);
