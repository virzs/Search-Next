import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { WidgetName } from './widget.schema';

export type WidgetVersionDocument = WidgetVersion & Document;

export const WidgetVersionName = 'WidgetVersion';

const WidgetAppIconSchema = {
  type: { type: String, enum: ['image', 'custom'], required: true },
  src: { type: String },
};

const WidgetScreenshotSchema = {
  mode: { type: String },
  themeId: { type: String, required: true },
  sizeId: { type: String, required: true },
  width: { type: Number },
  height: { type: Number },
  file: { type: String, required: true },
  url: { type: String, required: true },
};

@Schema({ timestamps: true })
export class WidgetVersion extends BaseSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WidgetName, required: true })
  widget: mongoose.Types.ObjectId;

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

  @Prop({ type: WidgetAppIconSchema })
  appIcon?: { type: 'image' | 'custom'; src?: string };

  @Prop({ type: String })
  appIconUrl?: string;

  @Prop({ type: [WidgetScreenshotSchema], default: [] })
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

export const WidgetVersionSchema = SchemaFactory.createForClass(WidgetVersion);
baseSchemaMiddleware(WidgetVersionSchema);
