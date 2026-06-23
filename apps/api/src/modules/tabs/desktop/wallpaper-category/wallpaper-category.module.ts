import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WallpaperCategoryController } from './wallpaper-category.controller';
import { WallpaperCategoryService } from './wallpaper-category.service';
import {
  WallpaperCategoryName,
  WallpaperCategorySchema,
} from './wallpaper-category.schema';
import { WallpaperName, WallpaperSchema } from '../wallpaper/wallpaper.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WallpaperCategoryName, schema: WallpaperCategorySchema },
      { name: WallpaperName, schema: WallpaperSchema },
    ]),
  ],
  controllers: [WallpaperCategoryController],
  providers: [WallpaperCategoryService],
})
export class WallpaperCategoryModule {}
