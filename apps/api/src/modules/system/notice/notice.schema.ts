import { ApiProperty } from "@nestjs/swagger";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Resource } from "src/modules/resource/schemas/resource";
import BaseSchema, {
  baseSchemaMiddleware,
} from "src/public/schema/base.schema";

export const SystemNoticeSchemaName = "SystemNotice";

@Schema({ timestamps: true })
export class SystemNotice extends BaseSchema {
  @ApiProperty({ description: "模块Key（如 tabs）", type: String })
  @Prop({ type: String, required: true })
  key: string;

  @ApiProperty({ description: "标题", type: String })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: "内容", type: String })
  @Prop({ type: String, required: true })
  content: string;

  @ApiProperty({ description: "封面", type: Resource, required: false })
  @Prop({ type: Resource })
  cover?: Resource;

  @ApiProperty({ description: "生效开始时间", type: Date, required: false })
  @Prop({ type: Date })
  effectiveStart?: Date;

  @ApiProperty({ description: "生效结束时间", type: Date, required: false })
  @Prop({ type: Date })
  effectiveEnd?: Date;

  @ApiProperty({ description: "是否启用", type: Boolean, default: true })
  @Prop({ type: Boolean, default: true })
  enable: boolean;

  // 自动生成公告的稳定来源键，用于发布重试时幂等复用。
  @Prop({ type: String })
  sourceKey?: string;

  @Prop({ type: String })
  sourceUrl?: string;
}

export const SystemNoticeSchema = SchemaFactory.createForClass(SystemNotice);

baseSchemaMiddleware(SystemNoticeSchema);

SystemNoticeSchema.index(
  { sourceKey: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceKey: { $type: "string" } },
  },
);
