import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { UsersName } from 'src/modules/users/schemas/ref-names';
import type { DesktopConfigJson } from './desktop-config-json.type';

export type UserDesktopConfigDocument = UserDesktopConfig & Document;

export const UserDesktopConfigName = 'UserDesktopConfig';

@Schema({ timestamps: true })
export class UserDesktopConfig extends BaseSchema {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: UsersName,
  })
  userId: string; // 用户ID

  @Prop({ required: true })
  name: string; // 配置名称

  @Prop()
  description?: string; // 配置描述

  @Prop({ type: Object, required: true })
  config: DesktopConfigJson; // 桌面配置JSON数据

  @Prop({ default: false })
  isDefault: boolean; // 是否为用户的默认配置

  @Prop({ default: 0 })
  sortOrder: number; // 排序
}

export const UserDesktopConfigSchema =
  SchemaFactory.createForClass(UserDesktopConfig);

// 应用基础中间件，确保默认不查询 isDelete=true，并隐藏 isDelete、__v
baseSchemaMiddleware(UserDesktopConfigSchema);
