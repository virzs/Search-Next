import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageDto } from 'src/public/dto/page';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';
import { User } from 'src/public/decorator/route-user.decoratpr';
import {
  CreateWallpaperDto,
  WallpaperGroupQueryDto,
  UpdateWallpaperDto,
  WallpaperQueryDto,
} from './wallpaper.dto';
import { WallpaperService } from './wallpaper.service';

@ApiTags('新标签页/桌面/壁纸')
@Controller('tabs/desktop/wallpaper')
export class WallpaperController {
  constructor(private readonly wallpaperService: WallpaperService) {}

  @Get('/upload')
  @ApiOperation({ summary: '壁纸分页' })
  getWallpapers(@Query() query: PageDto & WallpaperQueryDto) {
    return this.wallpaperService.getWallpapers(query);
  }

  @Get('/upload/active')
  @RequireLogin()
  @ApiOperation({ summary: '用户壁纸分页' })
  getActiveWallpapers(@Query() query: PageDto & { categoryId?: string }) {
    return this.wallpaperService.getActiveWallpapers(query);
  }

  @Get('/groups')
  @RequireLogin()
  @ApiOperation({ summary: '用户分组壁纸' })
  async getWallpaperGroups(@Query() query: WallpaperGroupQueryDto) {
    const uploads =
      await this.wallpaperService.getActiveWallpaperCategoryGroups(query);
    return { uploads, sources: [] };
  }

  @Post('/upload')
  @ApiOperation({ summary: '创建壁纸' })
  createWallpaper(@Body() body: CreateWallpaperDto, @User('_id') user: string) {
    return this.wallpaperService.createWallpaper(body, user);
  }

  @Put('/upload/:id')
  @ApiOperation({ summary: '更新壁纸' })
  updateWallpaper(
    @Param('id') id: string,
    @Body() body: UpdateWallpaperDto,
    @User('_id') user: string,
  ) {
    return this.wallpaperService.updateWallpaper(id, body, user);
  }

  @Put('/upload/:id/toggle')
  @ApiOperation({ summary: '切换壁纸启用状态' })
  toggleWallpaper(@Param('id') id: string, @User('_id') user: string) {
    return this.wallpaperService.toggleWallpaper(id, user);
  }

  @Delete('/upload/:id')
  @ApiOperation({ summary: '删除壁纸' })
  deleteWallpaper(@Param('id') id: string) {
    return this.wallpaperService.deleteWallpaper(id);
  }

  @Get('/upload/:id')
  @ApiOperation({ summary: '壁纸详情' })
  getWallpaperDetail(@Param('id') id: string) {
    return this.wallpaperService.getWallpaperDetail(id);
  }
}
