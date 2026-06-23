import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { RoleName } from 'src/modules/system/role/schemas/role';

export type UserConfigLimitDocument = UserConfigLimit & Document;

export const UserConfigLimitName = 'UserConfigLimit';

@Schema({ timestamps: true })
export class UserConfigLimit extends BaseSchema {
  @Prop({ required: true, default: 5 })
  defaultMaxConfigs: number; // 默认最大配置数量

  @Prop({ required: true, default: 10 })
  defaultMaxPages: number; // 单个配置中桌面默认最大分页数量

  @Prop({
    type: [
      {
        role: {
          type: mongoose.Schema.Types.ObjectId,
          ref: RoleName,
          required: true,
        },
        maxConfigs: { type: Number, required: true },
        maxPages: { type: Number, required: true },
      },
    ],
    default: [],
  })
  roleConfigs: Array<{ role: string; maxConfigs: number; maxPages: number }>; // 针对不同角色的配置限制

  @Prop()
  description?: string; // 规则描述
}

export const UserConfigLimitSchema =
  SchemaFactory.createForClass(UserConfigLimit);

// 应用基础中间件，确保默认不查询 isDelete=true，并隐藏 isDelete、__v
baseSchemaMiddleware(UserConfigLimitSchema);
