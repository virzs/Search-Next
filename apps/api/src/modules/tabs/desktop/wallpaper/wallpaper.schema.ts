import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { ResourceName } from 'src/modules/resource/schemas/ref-names';
import { WallpaperCategoryName } from '../wallpaper-category/wallpaper-category.schema';
import { Resource } from 'src/modules/resource/schemas/resource';

export type WallpaperDocument = Wallpaper & Document;
export const WallpaperName = 'Wallpaper';

@Schema({ timestamps: true })
export class Wallpaper extends BaseSchema {
  @Prop()
  name?: string;

  @Prop()
  description?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ResourceName,
    required: true,
  })
  image: Resource;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ResourceName,
  })
  thumbnail?: Resource;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WallpaperCategoryName })
  categoryId?: mongoose.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const WallpaperSchema = SchemaFactory.createForClass(Wallpaper);
baseSchemaMiddleware(WallpaperSchema);
