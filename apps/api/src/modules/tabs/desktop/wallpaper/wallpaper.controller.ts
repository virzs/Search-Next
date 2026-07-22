import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response as ExpressResponse } from "express";
import { PageDto } from "src/public/dto/page";
import { PublicRoute } from "src/public/decorator/public_route.decorator";
import { User } from "src/public/decorator/route-user.decoratpr";
import {
  CreateWallpaperDto,
  GradientWallpaperDto,
  ApplicationWallpaperDto,
  WallpaperGroupQueryDto,
  UpdateWallpaperDto,
  UpdateGradientWallpaperDto,
  WallpaperQueryDto,
} from "./wallpaper.dto";
import { WallpaperService } from "./wallpaper.service";

@ApiTags("新标签页/桌面/壁纸")
@Controller("tabs/desktop/wallpaper")
export class WallpaperController {
  constructor(private readonly wallpaperService: WallpaperService) {}

  @Get("/upload")
  @ApiOperation({ summary: "壁纸分页" })
  getWallpapers(@Query() query: PageDto & WallpaperQueryDto) {
    return this.wallpaperService.getWallpapers(query);
  }

  @Get("/upload/active")
  @PublicRoute()
  @ApiOperation({ summary: "用户壁纸分页" })
  getActiveWallpapers(@Query() query: PageDto & WallpaperQueryDto) {
    return this.wallpaperService.getActiveWallpapers(query);
  }

  @Get("/upload/active/:id")
  @PublicRoute()
  @ApiOperation({ summary: "有效壁纸详情" })
  getActiveWallpaperDetail(@Param("id") id: string) {
    return this.wallpaperService.getActiveWallpaperDetail(id);
  }

  @Get("/groups")
  @PublicRoute()
  @ApiOperation({ summary: "用户分组壁纸" })
  async getWallpaperGroups(@Query() query: WallpaperGroupQueryDto) {
    const uploads =
      await this.wallpaperService.getActiveWallpaperCategoryGroups(query);
    return { uploads, sources: [] };
  }

  @Post("/upload")
  @ApiOperation({ summary: "创建壁纸" })
  createWallpaper(@Body() body: CreateWallpaperDto, @User("_id") user: string) {
    return this.wallpaperService.createWallpaper(body, user);
  }

  @Post("/upload/gradient")
  @ApiOperation({ summary: "创建渐变壁纸" })
  createGradientWallpaper(
    @Body() body: GradientWallpaperDto,
    @User("_id") user: string,
  ) {
    return this.wallpaperService.createGradientWallpaper(body, user);
  }

  @Post("/upload/application")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 30 * 1024 * 1024 } }),
  )
  @ApiOperation({ summary: "创建网页壁纸" })
  createApplicationWallpaper(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ApplicationWallpaperDto,
    @User("_id") user: string,
  ) {
    return this.wallpaperService.createApplicationWallpaper(file, body, user);
  }

  @Put("/upload/:id/application")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 30 * 1024 * 1024 } }),
  )
  @ApiOperation({ summary: "更新网页壁纸" })
  updateApplicationWallpaper(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: ApplicationWallpaperDto,
    @User("_id") user: string,
  ) {
    return this.wallpaperService.updateApplicationWallpaper(
      id,
      file,
      body,
      user,
    );
  }

  @Put("/upload/:id/gradient")
  @ApiOperation({ summary: "更新渐变壁纸" })
  updateGradientWallpaper(
    @Param("id") id: string,
    @Body() body: UpdateGradientWallpaperDto,
    @User("_id") user: string,
  ) {
    return this.wallpaperService.updateGradientWallpaper(id, body, user);
  }

  @Put("/upload/:id")
  @ApiOperation({ summary: "更新壁纸" })
  updateWallpaper(
    @Param("id") id: string,
    @Body() body: UpdateWallpaperDto,
    @User("_id") user: string,
  ) {
    return this.wallpaperService.updateWallpaper(id, body, user);
  }

  @Put("/upload/:id/toggle")
  @ApiOperation({ summary: "切换壁纸启用状态" })
  toggleWallpaper(@Param("id") id: string, @User("_id") user: string) {
    return this.wallpaperService.toggleWallpaper(id, user);
  }

  @Delete("/upload/:id")
  @ApiOperation({ summary: "删除壁纸" })
  deleteWallpaper(@Param("id") id: string) {
    return this.wallpaperService.deleteWallpaper(id);
  }

  @Get("/upload/:id")
  @ApiOperation({ summary: "壁纸详情" })
  getWallpaperDetail(@Param("id") id: string) {
    return this.wallpaperService.getWallpaperDetail(id);
  }

  @Get("/runtime/:id/:revision/entry")
  @PublicRoute()
  @ApiOperation({ summary: "网页壁纸运行入口" })
  async getApplicationWallpaperEntry(
    @Param("id") id: string,
    @Param("revision") revision: string,
    @Res() response: ExpressResponse,
  ) {
    const runtime = await this.wallpaperService.getApplicationRuntimeFile(
      id,
      revision,
      "entry",
    );
    response.status(200);
    Object.entries(runtime.headers).forEach(([name, value]) =>
      response.setHeader(name, value),
    );
    response.setHeader("Content-Type", runtime.contentType);
    response.send(runtime.buffer);
  }

  @Get("/runtime/:id/:revision/preview")
  @PublicRoute()
  @ApiOperation({ summary: "网页壁纸预览图" })
  async getApplicationWallpaperPreview(
    @Param("id") id: string,
    @Param("revision") revision: string,
    @Res() response: ExpressResponse,
  ) {
    const runtime = await this.wallpaperService.getApplicationRuntimeFile(
      id,
      revision,
      "preview",
    );
    response.status(200);
    Object.entries(runtime.headers).forEach(([name, value]) =>
      response.setHeader(name, value),
    );
    response.setHeader("Content-Type", runtime.contentType);
    response.send(runtime.buffer);
  }

  @Get("/runtime/:id/:revision/assets/*path")
  @PublicRoute()
  @ApiOperation({ summary: "网页壁纸包内资源" })
  async getApplicationWallpaperAsset(
    @Param("id") id: string,
    @Param("revision") revision: string,
    @Param("path") assetPath: string | string[],
    @Res() response: ExpressResponse,
  ) {
    const normalizedPath = Array.isArray(assetPath)
      ? assetPath.join("/")
      : assetPath;
    const runtime = await this.wallpaperService.getApplicationRuntimeFile(
      id,
      revision,
      "asset",
      normalizedPath,
    );
    response.status(200);
    Object.entries(runtime.headers).forEach(([name, value]) =>
      response.setHeader(name, value),
    );
    response.setHeader("Content-Type", runtime.contentType);
    response.send(runtime.buffer);
  }
}
