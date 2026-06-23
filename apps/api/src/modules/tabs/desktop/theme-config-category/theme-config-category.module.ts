import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThemeConfigCategoryController } from './theme-config-category.controller';
import { ThemeConfigCategoryService } from './theme-config-category.service';
import {
  ThemeConfigName,
  ThemeConfigSchema,
} from '../theme-config/theme-config.schema';
import {
  ThemeCategoryName,
  ThemeCategorySchema,
} from './theme-config-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThemeCategoryName, schema: ThemeCategorySchema },
      { name: ThemeConfigName, schema: ThemeConfigSchema },
    ]),
  ],
  controllers: [ThemeConfigCategoryController],
  providers: [ThemeConfigCategoryService],
})
export class ThemeConfigCategoryModule {}
