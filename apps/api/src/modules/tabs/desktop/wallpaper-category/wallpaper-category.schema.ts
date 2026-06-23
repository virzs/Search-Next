import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

export type WallpaperCategoryDocument = WallpaperCategory & Document;
export const WallpaperCategoryName = 'WallpaperCategory';

@Schema({ timestamps: true })
export class WallpaperCategory extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const WallpaperCategorySchema =
  SchemaFactory.createForClass(WallpaperCategory);

baseSchemaMiddleware(WallpaperCategorySchema);
