import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

export type ThemeCategoryDocument = ThemeCategory & Document;
export const ThemeCategoryName = 'ThemeCategory';

@Schema({ timestamps: true })
export class ThemeCategory extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}
export const ThemeCategorySchema = SchemaFactory.createForClass(ThemeCategory);

baseSchemaMiddleware(ThemeCategorySchema);
