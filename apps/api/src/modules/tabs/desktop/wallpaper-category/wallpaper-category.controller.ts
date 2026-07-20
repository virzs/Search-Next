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
import { User } from 'src/public/decorator/route-user.decoratpr';
import { PublicRoute } from 'src/public/decorator/public_route.decorator';
import { WallpaperCategoryService } from './wallpaper-category.service';
import {
  CreateWallpaperCategoryDto,
  UpdateWallpaperCategoryDto,
  WallpaperCategoryQueryDto,
} from './wallpaper-category.dto';

@ApiTags('新标签页/桌面/壁纸分类')
@Controller('tabs/desktop/wallpaper/category')
export class WallpaperCategoryController {
  constructor(
    private readonly wallpaperCategoryService: WallpaperCategoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: '壁纸分类分页' })
  getWallpaperCategories(@Query() query: PageDto & WallpaperCategoryQueryDto) {
    return this.wallpaperCategoryService.getWallpaperCategories(query);
  }

  @Get('/user')
  @PublicRoute()
  @ApiOperation({ summary: '用户壁纸分类列表' })
  getUserWallpaperCategories(
    @Query('type') type?: 'image' | 'application',
  ) {
    return this.wallpaperCategoryService.getUserWallpaperCategories(type);
  }

  @Get('/admin/enabled')
  @ApiOperation({ summary: '启用壁纸分类列表' })
  getAdminEnabledWallpaperCategories() {
    return this.wallpaperCategoryService.getAdminEnabledWallpaperCategories();
  }

  @Post()
  @ApiOperation({ summary: '创建壁纸分类' })
  createWallpaperCategory(
    @Body() body: CreateWallpaperCategoryDto,
    @User('_id') user: string,
  ) {
    return this.wallpaperCategoryService.createWallpaperCategory(body, user);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新壁纸分类' })
  updateWallpaperCategory(
    @Param('id') id: string,
    @Body() body: UpdateWallpaperCategoryDto,
    @User('_id') user: string,
  ) {
    return this.wallpaperCategoryService.updateWallpaperCategory(
      id,
      body,
      user,
    );
  }

  @Put('/:id/toggle')
  @ApiOperation({ summary: '切换壁纸分类启用状态' })
  toggleWallpaperCategory(@Param('id') id: string, @User('_id') user: string) {
    return this.wallpaperCategoryService.toggleWallpaperCategory(id, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除壁纸分类' })
  deleteWallpaperCategory(@Param('id') id: string) {
    return this.wallpaperCategoryService.deleteWallpaperCategory(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: '壁纸分类详情' })
  getWallpaperCategoryDetail(@Param('id') id: string) {
    return this.wallpaperCategoryService.getWallpaperCategoryDetail(id);
  }
}
