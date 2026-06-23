import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import BaseSchema from 'src/public/schema/base.schema';
import { Permission } from '../../../../schemas/permission';

export const RoleName = 'Role';

export const SYSTEM_ADMIN_ROLE_CODE = 'system_admin';

@Schema({ timestamps: true })
export class Role extends BaseSchema {
  @Prop({ type: String, unique: true, sparse: true })
  code: string;

  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }] })
  permissions: Permission[];

  @Prop({ type: Boolean, default: false })
  isSystem: boolean;

  @Prop({ type: Boolean, default: false })
  isSuperAdmin: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
