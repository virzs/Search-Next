import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import type { DesktopConfigJson } from './desktop-config-json.type';

export type AdminDesktopConfigDocument = AdminDesktopConfig & Document;

export const AdminDesktopConfigName = 'AdminDesktopConfig';

@Schema({ timestamps: true })
export class AdminDesktopConfig extends BaseSchema {
  @Prop({ required: true })
  name: string; // 配置名称

  @Prop()
  description?: string; // 配置描述

  @Prop({ type: Object, required: true })
  config: DesktopConfigJson; // 桌面配置JSON数据

  @Prop({ default: false })
  isActive: boolean; // 是否为当前生效的配置（同时只能有一个为true）

  @Prop({ default: 0 })
  sortOrder: number; // 排序
}

export const AdminDesktopConfigSchema =
  SchemaFactory.createForClass(AdminDesktopConfig);

// 应用基础中间件，确保默认不查询 isDelete=true，并隐藏 isDelete、__v
baseSchemaMiddleware(AdminDesktopConfigSchema);
