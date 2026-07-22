import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  WallpaperCollectionName,
  WallpaperCollectionSchema,
} from "./wallpaper-collection.schema";
import { WallpaperCollectionController } from "./wallpaper-collection.controller";
import { WallpaperCollectionService } from "./wallpaper-collection.service";
import { WallpaperName, WallpaperSchema } from "../wallpaper/wallpaper.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WallpaperCollectionName, schema: WallpaperCollectionSchema },
      { name: WallpaperName, schema: WallpaperSchema },
    ]),
  ],
  controllers: [WallpaperCollectionController],
  providers: [WallpaperCollectionService],
  exports: [WallpaperCollectionService],
})
export class WallpaperCollectionModule {}
