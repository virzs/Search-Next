import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import BaseSchema from 'src/public/schema/base.schema';

@Schema({ timestamps: true })
export class Notice extends BaseSchema {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  //   是否启用
  @Prop({ type: Boolean, default: true })
  enable: boolean;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
