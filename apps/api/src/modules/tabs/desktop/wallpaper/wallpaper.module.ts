import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WallpaperController } from './wallpaper.controller';
import { WallpaperService } from './wallpaper.service';
import { WallpaperName, WallpaperSchema } from './wallpaper.schema';
import { ResourceModule } from 'src/modules/resource/resource.module';
import { StorageServiceModule } from 'src/modules/system/storage-service/storage-service.module';
import {
  WallpaperCategoryName,
  WallpaperCategorySchema,
} from '../wallpaper-category/wallpaper-category.schema';

@Module({
  imports: [
    ResourceModule,
    StorageServiceModule,
    MongooseModule.forFeature([
      { name: WallpaperName, schema: WallpaperSchema },
      { name: WallpaperCategoryName, schema: WallpaperCategorySchema },
    ]),
  ],
  controllers: [WallpaperController],
  providers: [WallpaperService],
  exports: [WallpaperService],
})
export class WallpaperModule {}
