import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import BaseSchema, { baseSchemaMiddleware } from 'src/public/schema/base.schema';
import { WebsiteName } from './ref-names';
import { Website } from './website';

@Schema({ timestamps: true })
export class WebsiteCollection extends BaseSchema {
  @ApiProperty({ description: '标题', type: String, required: true })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: '简介', type: String, required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ description: '是否启用', type: Boolean, default: true })
  @Prop({ type: Boolean, default: true })
  enable: boolean;

  @ApiProperty({ description: '生效开始时间', type: Date, required: false })
  @Prop({ type: Date })
  effectiveStart?: Date;

  @ApiProperty({ description: '生效结束时间', type: Date, required: false })
  @Prop({ type: Date })
  effectiveEnd?: Date;

  @ApiProperty({ description: '排序', type: Number, default: 0 })
  @Prop({ type: Number, default: 0 })
  sort: number;

  @ApiProperty({ description: '绑定网站', type: [Website] })
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: WebsiteName }],
    default: [],
  })
  websites: Website[];

  @ApiProperty({
    description: '合集类型：static=手动绑定，dynamic=按规则自动生成',
    enum: ['static', 'dynamic'],
    default: 'static',
  })
  @Prop({ type: String, default: 'static' })
  type: 'static' | 'dynamic';

  @ApiProperty({
    description: '动态合集规则',
    required: false,
    type: Object,
  })
  @Prop({
    type: {
      classifyIds: { type: [String], default: [] },
      tags: { type: [String], default: [] },
      sortBy: { type: String, default: 'createdAt' },
      sortOrder: { type: String, default: 'desc' },
      limit: { type: Number, default: 200 },
    },
  })
  dynamic?: {
    classifyIds?: string[];
    tags?: string[];
    sortBy?: 'createdAt' | 'updatedAt' | 'click';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  };

  @ApiProperty({ description: '动态合集刷新频率（秒）', required: false, default: 300 })
  @Prop({ type: Number, default: 300 })
  updateIntervalSec?: number;

  @ApiProperty({ description: '动态合集缓存的站点ID列表', required: false, type: [String] })
  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [] })
  cachedWebsiteIds?: mongoose.Schema.Types.ObjectId[];

  @ApiProperty({ description: '动态合集缓存刷新时间', required: false, type: Date })
  @Prop({ type: Date })
  cachedAt?: Date;
}

export const WebsiteCollectionSchema =
  SchemaFactory.createForClass(WebsiteCollection);

baseSchemaMiddleware(WebsiteCollectionSchema);
