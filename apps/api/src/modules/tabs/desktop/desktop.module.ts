import { Module } from '@nestjs/common';
import { DesktopConfigModule } from './desktop-config/desktop-config.module';
import { UserLimitModule } from './user-limit/user-limit.module';
import { ThemeConfigModule } from './theme-config/theme-config.module';
import { ThemeConfigCategoryModule } from './theme-config-category/theme-config-category.module';
import { WallpaperModule } from './wallpaper/wallpaper.module';
import { WallpaperCategoryModule } from './wallpaper-category/wallpaper-category.module';

@Module({
  imports: [
    DesktopConfigModule,
    UserLimitModule,
    ThemeConfigModule,
    ThemeConfigCategoryModule,
    WallpaperModule,
    WallpaperCategoryModule,
  ],
  exports: [
    DesktopConfigModule,
    UserLimitModule,
    ThemeConfigModule,
    ThemeConfigCategoryModule,
    WallpaperModule,
    WallpaperCategoryModule,
  ],
})
export class DesktopModule {}
