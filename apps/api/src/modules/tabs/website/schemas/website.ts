import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { WebsiteClassifyName, WebsiteTagName } from './ref-names';
import { WebsiteClassify } from './classify';
import mongoose from 'mongoose';
import { WebsiteTag } from './tag';
import { ApiProperty } from '@nestjs/swagger';
import { Resource } from 'src/modules/resource/schemas/resource';

@Schema({ timestamps: true })
export class Website extends BaseSchema {
  @ApiProperty({ description: '名称', type: String, required: true })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ description: '网址', type: String, required: true })
  @Prop({ type: String, required: true })
  url: string;

  @ApiProperty({ description: '图标', type: Resource })
  @Prop({ type: Resource })
  icon: Resource;

  @ApiProperty({ description: '手动编辑图标', type: Resource })
  @Prop({ type: Resource })
  iconEdited: Resource;

  @ApiProperty({ description: '描述', type: String })
  @Prop({ type: String })
  description: string;

  @ApiProperty({ description: '点击量', type: Number, default: 0 })
  @Prop({ type: Number, default: 0 })
  click: number;

  @ApiProperty({ description: '是否启用', type: Boolean, default: true })
  @Prop({ type: Boolean, default: true })
  enable: boolean;

  @ApiProperty({ description: '是否公开', type: Boolean, default: false })
  @Prop({ type: Boolean, default: false })
  public: boolean;

  @ApiProperty({ description: '分类', type: WebsiteClassify })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WebsiteClassifyName })
  classify: WebsiteClassify;

  @ApiProperty({ description: '标签', type: [WebsiteTag] })
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: WebsiteTagName }],
  })
  tags: WebsiteTag[];

  @ApiProperty({ description: '主题色', type: String })
  @Prop({ type: String })
  themeColor: string;
}

export const WebsiteSchema = SchemaFactory.createForClass(Website);

baseSchemaMiddleware(WebsiteSchema);
