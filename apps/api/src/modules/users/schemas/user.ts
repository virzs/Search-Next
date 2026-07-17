import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import BaseSchema, { baseSchemaPreFind } from 'src/public/schema/base.schema';
import { Role, RoleName } from '../../system/role/schemas/role';
import { Project } from '../../system/project/schemas/project';
import { Resource } from 'src/modules/resource/schemas/resource';
import { UsersName } from './ref-names';

@Schema({ _id: false })
export class LegalConfirmation {
  @Prop({ type: String, enum: ['terms', 'privacy'], required: true })
  documentType: 'terms' | 'privacy';

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LegalDocument',
    required: true,
  })
  revisionId: string;

  @Prop({ type: Number, required: true })
  consentVersion: number;

  @Prop({ type: Date, required: true })
  firstConfirmedAt: Date;

  @Prop({ type: Date, required: true })
  lastConfirmedAt: Date;

  @Prop({ type: Number, default: 1 })
  confirmationCount: number;

  @Prop({ type: String, enum: ['register', 'login', 'in_app'] })
  firstSource: 'register' | 'login' | 'in_app';

  @Prop({ type: String, enum: ['register', 'login', 'in_app'] })
  lastSource: 'register' | 'login' | 'in_app';

  @Prop({ type: String, enum: ['zh-CN', 'en-US'], default: 'zh-CN' })
  locale: 'zh-CN' | 'en-US';
}

const LegalConfirmationSchema = SchemaFactory.createForClass(LegalConfirmation);

@Schema({ timestamps: true })
export class User extends BaseSchema {
  @Prop({ type: String })
  nickname?: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: String, select: false })
  salt: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: Resource })
  avatar: Resource;

  // 账号状态 0:未验证邮箱 1:正常 2:禁用
  @Prop({ type: Number, default: 0, select: false })
  status: number;

  //  角色
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: RoleName }],
    select: false,
  })
  roles: Role[];

  // 类型 0: 管理员 1: 普通用户
  @Prop({ type: Number, default: 1, select: false })
  type: number;

  // 项目
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    select: false,
  })
  projects: Project[];

  // 是否启用
  @Prop({ type: Boolean, default: true, select: false })
  enable: boolean;

  // 当前积分
  @Prop({ type: Number, default: 0, select: false })
  integral: number;

  @Prop({ type: [LegalConfirmationSchema], default: [], select: false })
  legalConfirmations: LegalConfirmation[];

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: UsersName,
    select: false,
  })
  creator: string;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: UsersName,
    select: false,
  })
  updater: string;

  @Prop({ type: Boolean, default: false, select: false })
  isDelete: boolean;

  @Prop({ type: Date, select: false })
  createdAt: Date;

  @Prop({ type: Date, select: false })
  updatedAt: Date;
}

export const UsersSchema = SchemaFactory.createForClass(User);

UsersSchema.pre('find', baseSchemaPreFind);

UsersSchema.methods.toJSON = function () {
  const { __v, ...data } = this.toObject();
  return data;
};
