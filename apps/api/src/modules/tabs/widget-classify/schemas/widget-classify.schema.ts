import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { ResourceName } from 'src/modules/resource/schemas/ref-names';

export type WidgetClassifyDocument = WidgetClassify & Document;

export const WidgetClassifyName = 'WidgetClassify';

@Schema({ timestamps: true })
export class WidgetClassify extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  @Prop({ type: Boolean, default: true })
  enable: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ResourceName })
  icon?: mongoose.Types.ObjectId;
}

export const WidgetClassifySchema =
  SchemaFactory.createForClass(WidgetClassify);
baseSchemaMiddleware(WidgetClassifySchema);
