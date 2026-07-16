import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { VersionService } from "./version.service";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PageDto } from "src/public/dto/page";
import { VersionDto } from "./dto/version.dto";
import { User } from "src/public/decorator/route-user.decoratpr";
import { PublicRoute } from "src/public/decorator/public_route.decorator";
import { ReleasePublicationService } from "./release-publication.service";
import { PublishReleaseDto } from "./release-publication.dto";
import type { ReleaseComponent } from "./release-publication.schema";

@ApiTags("系统/版本管理")
@Controller("system/version")
export class VersionController {
  constructor(
    private readonly versionService: VersionService,
    private readonly releasePublicationService: ReleasePublicationService,
  ) {}

  @Get("/")
  @ApiOperation({ summary: "版本分页" })
  @ApiQuery({ type: PageDto })
  page(@Query() query: PageDto) {
    return this.versionService.page(query);
  }

  @Post("/")
  @ApiOperation({ summary: "创建版本" })
  create(@Body() body: VersionDto, @User("_id") user) {
    return this.versionService.create(body, user);
  }

  @Put("/:id")
  @ApiOperation({ summary: "更新版本" })
  update(@Param("id") id: string, @Body() body: VersionDto, @User("_id") user) {
    return this.versionService.update(id, body, user);
  }

  @Delete("/:id")
  @ApiOperation({ summary: "删除版本" })
  delete(@Param("id") id: string, @User("_id") user) {
    return this.versionService.delete(id, user);
  }

  @Get("/latest")
  @PublicRoute()
  @ApiOperation({ summary: "最新版本" })
  latest(@Query("platform") platform: string) {
    return this.versionService.latest(platform);
  }

  @Get("/release-candidates")
  @ApiOperation({ summary: "读取仓库中的 Web/Admin Release 候选项" })
  releaseCandidates(@Query("refresh") refresh?: string) {
    return this.releasePublicationService.candidates(refresh === "true");
  }

  @Get("/release-publications")
  @ApiOperation({ summary: "Web/Admin 发布记录" })
  releasePublications(
    @Query() query: PageDto & { component?: ReleaseComponent },
  ) {
    return this.releasePublicationService.page(query);
  }

  @Post("/release-publications")
  @ApiOperation({ summary: "发布 Web/Admin Release 公告" })
  publishRelease(@Body() body: PublishReleaseDto, @User("_id") user: string) {
    return this.releasePublicationService.publish(body, user);
  }

  @Get("/release-publications/latest")
  @PublicRoute()
  @Header("Cache-Control", "no-store")
  @ApiOperation({ summary: "最新已发布 Web/Admin 版本" })
  latestReleasePublication(@Query("component") component: ReleaseComponent) {
    return this.releasePublicationService.latest(component);
  }

  @Get("/:id")
  @ApiOperation({ summary: "版本详情" })
  detail(@Param("id") id: string) {
    return this.versionService.detail(id);
  }
}
