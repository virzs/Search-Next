import { Module } from "@nestjs/common";
import { DesktopConfigModule } from "./desktop-config/desktop-config.module";
import { UserLimitModule } from "./user-limit/user-limit.module";
import { ThemeConfigModule } from "./theme-config/theme-config.module";
import { ThemeConfigCategoryModule } from "./theme-config-category/theme-config-category.module";
import { WallpaperModule } from "./wallpaper/wallpaper.module";
import { WallpaperCategoryModule } from "./wallpaper-category/wallpaper-category.module";
import { WallpaperCollectionModule } from "./wallpaper-collection/wallpaper-collection.module";

@Module({
  imports: [
    DesktopConfigModule,
    UserLimitModule,
    ThemeConfigModule,
    ThemeConfigCategoryModule,
    WallpaperModule,
    WallpaperCategoryModule,
    WallpaperCollectionModule,
  ],
  exports: [
    DesktopConfigModule,
    UserLimitModule,
    ThemeConfigModule,
    ThemeConfigCategoryModule,
    WallpaperModule,
    WallpaperCategoryModule,
    WallpaperCollectionModule,
  ],
})
export class DesktopModule {}
