import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import BaseSchema, {
  baseSchemaMiddleware,
} from "src/public/schema/base.schema";
import { ResourceName } from "src/modules/resource/schemas/ref-names";
import { WallpaperCategoryName } from "../wallpaper-category/wallpaper-category.schema";
import { Resource } from "src/modules/resource/schemas/resource";

export type WallpaperDocument = Wallpaper & Document;
export const WallpaperName = "Wallpaper";

export type WallpaperType = "image" | "application";

export type WallpaperApplicationPackage = {
  packageName: string;
  version: string;
  entry: string;
  preview: string;
  author?: string;
  projectUrl?: string;
  description?: string;
  revision: string;
  storageDir: string;
};

@Schema({ timestamps: true })
export class Wallpaper extends BaseSchema {
  @Prop({ type: String, enum: ["image", "application"], default: "image" })
  type: WallpaperType;

  @Prop()
  name?: string;

  @Prop()
  description?: string;

  @Prop()
  author?: string;

  @Prop()
  url?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ResourceName,
  })
  image?: Resource;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ResourceName,
  })
  thumbnail?: Resource;

  @Prop({
    type: {
      packageName: { type: String, required: true },
      version: { type: String, required: true },
      entry: { type: String, required: true },
      preview: { type: String, required: true },
      author: { type: String },
      projectUrl: { type: String },
      description: { type: String },
      revision: { type: String, required: true },
      storageDir: { type: String, required: true },
    },
    _id: false,
  })
  application?: WallpaperApplicationPackage;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WallpaperCategoryName })
  categoryId?: mongoose.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const WallpaperSchema = SchemaFactory.createForClass(Wallpaper);
baseSchemaMiddleware(WallpaperSchema);
