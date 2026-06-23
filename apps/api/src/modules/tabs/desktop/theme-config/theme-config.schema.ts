import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { ResourceName } from 'src/modules/resource/schemas/ref-names';
import { ThemeCategoryName } from '../theme-config-category/theme-config-category.schema';

export type ThemeConfigDocument = ThemeConfig & Document;

export const ThemeConfigName = 'ThemeConfig';

@Schema({ timestamps: true })
export class ThemeConfig extends BaseSchema {
  @Prop({ required: true })
  name: string; // 主题名称

  @Prop()
  description?: string; // 主题描述

  @Prop({ type: Object, required: true })
  lightConfig: any; // 浅色主题配置JSON数据

  @Prop({ type: Object })
  darkConfig?: any; // 深色主题配置JSON数据（可选）

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: ResourceName }],
    default: [],
  })
  previewImages: mongoose.Types.ObjectId[]; // 预览图数组，关联Resource模块

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ThemeCategoryName })
  categoryId?: mongoose.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean; // 是否启用

  @Prop({ default: 0 })
  sortOrder: number; // 排序
}

export const ThemeConfigSchema = SchemaFactory.createForClass(ThemeConfig);

// 应用基础中间件，确保默认不查询 isDelete=true，并隐藏 isDelete、__v
baseSchemaMiddleware(ThemeConfigSchema);
