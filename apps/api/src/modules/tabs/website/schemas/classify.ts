import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { WebsiteClassifyName, WebsiteName } from './ref-names';
import mongoose from 'mongoose';
import { Website } from './website';
import { ApiProperty } from '@nestjs/swagger';
import { Resource } from 'src/modules/resource/schemas/resource';

@Schema({ timestamps: true })
export class WebsiteClassify extends BaseSchema {
  @ApiProperty({ description: '名称', type: String, required: true })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ description: '描述', type: String })
  @Prop({ type: String })
  description: string;

  @ApiProperty({ description: '图标', type: Resource })
  @Prop({ type: Resource })
  icon: Resource;

  @ApiProperty({ description: '排序', type: Number, default: 0 })
  @Prop({ type: Number, default: 0 })
  sort: number;

  @ApiProperty({ description: '是否启用', type: Boolean, default: true })
  @Prop({ type: Boolean, default: true })
  enable: boolean;

  @ApiProperty({ description: '网站', type: [Website] })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: WebsiteName }] })
  websites: Website[];

  @ApiProperty({ description: '子分类', type: [WebsiteClassify] })
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: WebsiteClassifyName }],
  })
  children: WebsiteClassify[];

  @ApiProperty({ description: '父级分类', type: WebsiteClassify })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WebsiteClassifyName })
  parent: WebsiteClassify;
}

export const WebsiteClassifySchema =
  SchemaFactory.createForClass(WebsiteClassify);

baseSchemaMiddleware(WebsiteClassifySchema);
