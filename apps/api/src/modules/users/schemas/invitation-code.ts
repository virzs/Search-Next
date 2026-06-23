// 邀请码

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import BaseSchema, {
  baseSchemaPreFind,
  baseSchemaToJSON,
} from 'src/public/schema/base.schema';
import { UsersName } from './ref-names';
import { Role, RoleName } from 'src/modules/system/role/schemas/role';
import { User } from './user';

@Schema({ timestamps: true })
export class InvitationCode extends BaseSchema {
  @Prop({ type: String, required: true, unique: true })
  code: string;

  // 邀请人注册后默认拥有的角色
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: RoleName }] })
  roles: Role[];

  //   受邀请的用户
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: UsersName }] })
  users: User[];

  //   最大使用次数
  @Prop({ type: Number, default: 1 })
  maxUse: number;

  //   状态 0: 已生效 1: 已失效 2:已禁用
  @Prop({ type: Number, default: 0 })
  status: number;

  //   使用次数
  @Prop({ type: Number, default: 0 })
  useCount: number;

  // 有效期
  @Prop({ type: Date })
  expire: Date;
}

export const InvitationCodeSchema =
  SchemaFactory.createForClass(InvitationCode);

InvitationCodeSchema.pre('find', baseSchemaPreFind);

InvitationCodeSchema.methods.toJSON = baseSchemaToJSON;
