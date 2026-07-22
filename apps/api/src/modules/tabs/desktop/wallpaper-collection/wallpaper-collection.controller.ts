import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PublicRoute } from "src/public/decorator/public_route.decorator";
import { User } from "src/public/decorator/route-user.decoratpr";
import {
  WallpaperCollectionDto,
  WallpaperCollectionForAdminDto,
  WallpaperCollectionPreviewDynamicDto,
  WallpaperCollectionPublicQueryDto,
  WallpaperCollectionWallpapersPageDto,
} from "./wallpaper-collection.dto";
import { WallpaperCollectionService } from "./wallpaper-collection.service";

@ApiTags("新标签页/桌面/壁纸合集")
@Controller("tabs/desktop/wallpaper/collection")
export class WallpaperCollectionController {
  constructor(private readonly collectionService: WallpaperCollectionService) {}

  @Get("/public/list")
  @PublicRoute()
  @ApiOperation({ summary: "公开壁纸合集列表" })
  getAllCollectionsForPublic(
    @Query() query: WallpaperCollectionPublicQueryDto,
  ) {
    return this.collectionService.getAllForPublic(query);
  }

  @Get("/public/:id/wallpapers")
  @PublicRoute()
  @ApiOperation({ summary: "合集壁纸分页" })
  getCollectionWallpapersPage(
    @Param("id") id: string,
    @Query() query: WallpaperCollectionWallpapersPageDto,
  ) {
    return this.collectionService.getCollectionWallpapersPage(id, query, true);
  }

  @Get("/")
  @ApiOperation({ summary: "壁纸合集分页" })
  getCollections(@Query() query: WallpaperCollectionForAdminDto) {
    return this.collectionService.getCollections(query);
  }

  @Post("/")
  @ApiOperation({ summary: "创建壁纸合集" })
  createCollection(
    @Body() body: WallpaperCollectionDto,
    @User("_id") user: string,
  ) {
    return this.collectionService.createCollection(body, user);
  }

  @Post("/preview_dynamic")
  @ApiOperation({ summary: "动态壁纸合集预览" })
  previewDynamic(@Body() body: WallpaperCollectionPreviewDynamicDto) {
    return this.collectionService.previewDynamic(body);
  }

  @Put("/:id")
  @ApiOperation({ summary: "更新壁纸合集" })
  updateCollection(
    @Param("id") id: string,
    @Body() body: WallpaperCollectionDto,
    @User("_id") user: string,
  ) {
    return this.collectionService.updateCollection(id, body, user);
  }

  @Delete("/:id")
  @ApiOperation({ summary: "删除壁纸合集" })
  deleteCollection(@Param("id") id: string) {
    return this.collectionService.deleteCollection(id);
  }

  @Get("/:id")
  @ApiOperation({ summary: "壁纸合集详情" })
  getCollectionDetail(@Param("id") id: string) {
    return this.collectionService.detail(id);
  }
}
