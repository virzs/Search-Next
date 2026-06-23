import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import BaseSchema, {
  baseSchemaPreFind,
  baseSchemaToJSON,
} from 'src/public/schema/base.schema';
import mongoose from 'mongoose';
import { PermissionName } from './ref-names';

@Schema({ timestamps: true })
export class Permission extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  url: string;

  @Prop({ type: String })
  method: string;

  //   权限类型 0:菜单 1:按钮
  @Prop({ type: Number })
  type: number;

  //   上级权限，关联当前 schema
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PermissionName })
  parent: Permission;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: PermissionName }],
  })
  children: Permission[];

  @Prop({ type: Number })
  level?: number;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

PermissionSchema.pre('find', baseSchemaPreFind);

PermissionSchema.methods.toJSON = baseSchemaToJSON;
