import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Resource } from 'src/modules/resource/schemas/resource';
import BaseSchema, {
  baseSchemaPreFind,
  baseSchemaToJSON,
} from 'src/public/schema/base.schema';

export const VersionName = 'Version';

@Schema()
export class Platform {
  @Prop({ type: String, enum: ['windows', 'mac'], required: true })
  platform: string;
  @Prop({ type: Resource, required: true })
  source: Resource;
  // 更新方式 1: 强制更新 2: 可选更新
  @Prop({ type: Number, enum: [1, 2, '1', '2'], required: true })
  updateType: number;
}

const PlatformSchema = SchemaFactory.createForClass(Platform);

@Schema()
export class BaseVersion extends BaseSchema {
  @Prop({ type: String, required: true, unique: true })
  version: string;

  // 更新内容
  @Prop({ type: String, required: true })
  content: string;

  // 定时发布时间
  @Prop({ type: Date })
  releaseTime: Date;
}

@Schema({ timestamps: true })
export class Version extends BaseVersion {
  @Prop({
    type: [PlatformSchema],
    required: true,
  })
  platforms: Platform[];
}

@Schema()
export class LastVersion extends BaseVersion {
  @Prop({ type: String })
  platform: Platform;
}

export const VersionSchema = SchemaFactory.createForClass(Version);

VersionSchema.pre('find', baseSchemaPreFind);

VersionSchema.methods.toJSON = baseSchemaToJSON;
