import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import BaseSchema, {
  baseSchemaMiddleware,
} from "src/public/schema/base.schema";

export const ReleasePublicationName = "ReleasePublication";
export type ReleaseComponent = "web" | "admin";

@Schema({ timestamps: true })
export class ReleasePublication extends BaseSchema {
  @Prop({ type: String, enum: ["web", "admin"], required: true })
  component: ReleaseComponent;

  @Prop({ type: String, required: true })
  repositoryUrl: string;

  @Prop({ type: Number, required: true })
  githubReleaseId: number;

  @Prop({ type: String, required: true })
  tagName: string;

  @Prop({ type: String, required: true })
  version: string;

  @Prop({ type: String, required: true })
  releaseName: string;

  @Prop({ type: String, required: true })
  releaseUrl: string;

  @Prop({ type: Date, required: true })
  releasePublishedAt: Date;

  @Prop({ type: String, required: true })
  announcementTitle: string;

  @Prop({ type: String, required: true })
  announcementContent: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemNotice",
    required: false,
  })
  // 仅兼容历史发布记录，新版本发布不会再写入通知模块。
  noticeId?: string;

  @Prop({ type: Date, required: true })
  publishedAt: Date;
}

export const ReleasePublicationSchema =
  SchemaFactory.createForClass(ReleasePublication);

ReleasePublicationSchema.index(
  { repositoryUrl: 1, component: 1, githubReleaseId: 1 },
  { unique: true },
);
baseSchemaMiddleware(ReleasePublicationSchema, { enableSkipMiddleware: true });
