import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

@Schema({ timestamps: true })
export class Resource extends BaseSchema {
  @ApiProperty({ description: '资源名称' })
  @Prop({ type: String })
  name: string;

  @ApiProperty({ description: '资源key' })
  @Prop({ type: String })
  key: string;

  @ApiProperty({ description: '资源类型' })
  @Prop({ type: String })
  mimetype: string;

  @ApiProperty({ description: '资源目录' })
  @Prop({ type: String })
  dir: string;

  @ApiProperty({ description: '资源大小' })
  @Prop({ type: Number })
  size: number;

  @ApiProperty({ description: '资源地址' })
  @Prop({ type: String })
  url: string;

  @ApiProperty({ description: '存储服务' })
  @Prop({ type: String })
  service: 'qiniu' | 'r2' | 'local';
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

// 使用通用的中间件配置，启用跳过功能
baseSchemaMiddleware(ResourceSchema, {
  enableSkipMiddleware: true, // 启用跳过中间件功能
});
