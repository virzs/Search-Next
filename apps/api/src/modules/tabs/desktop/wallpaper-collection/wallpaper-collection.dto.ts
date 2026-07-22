import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { PageDto } from "src/public/dto/page";

export class WallpaperCollectionForAdminDto extends PageDto {
  @ApiProperty({ description: "搜索标题", required: false })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;

  @ApiProperty({ description: "仅查询当前生效中的合集", required: false })
  @IsString()
  @IsOptional()
  @Expose()
  active?: string;
}

export class WallpaperCollectionDynamicDto {
  @ApiProperty({ description: "分类ID列表", required: false, type: [String] })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  @Expose()
  categoryIds?: string[];

  @ApiProperty({
    description: "壁纸类型列表",
    required: false,
    enum: ["image", "gradient", "application"],
    isArray: true,
  })
  @IsIn(["image", "gradient", "application"], { each: true })
  @IsArray()
  @IsOptional()
  @Expose()
  wallpaperTypes?: Array<"image" | "gradient" | "application">;

  @ApiProperty({
    description: "排序字段",
    required: false,
    enum: ["createdAt", "updatedAt", "sortOrder"],
    default: "createdAt",
  })
  @IsIn(["createdAt", "updatedAt", "sortOrder"])
  @IsOptional()
  @Expose()
  sortBy?: "createdAt" | "updatedAt" | "sortOrder";

  @ApiProperty({
    description: "排序方向",
    required: false,
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsIn(["asc", "desc"])
  @IsOptional()
  @Expose()
  sortOrder?: "asc" | "desc";

  @ApiProperty({ description: "最大数量", required: false, default: 200 })
  @IsNumber()
  @Min(1)
  @Max(5000)
  @IsOptional()
  @Expose()
  limit?: number;
}

export class WallpaperCollectionDto {
  @ApiProperty({ description: "标题" })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({ description: "简介", required: false })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({ description: "编辑短标题", required: false })
  @IsString()
  @IsOptional()
  @Expose()
  kicker?: string;

  @ApiProperty({ description: "封面图", required: false })
  @IsObject()
  @IsOptional()
  @Expose()
  cover?: Record<string, unknown>;

  @ApiProperty({ description: "强调色", required: false })
  @IsString()
  @IsOptional()
  @Expose()
  accentColor?: string;

  @ApiProperty({
    description: "展示布局",
    required: false,
    enum: ["story", "compact"],
    default: "story",
  })
  @IsIn(["story", "compact"])
  @IsOptional()
  @Expose()
  layout?: "story" | "compact";

  @ApiProperty({ description: "是否推荐为大卡", required: false })
  @IsBoolean()
  @IsOptional()
  @Expose()
  featured?: boolean;

  @ApiProperty({ description: "前台预览数量", required: false })
  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  @Expose()
  itemLimit?: number;

  @ApiProperty({ description: "是否启用", required: false })
  @IsBoolean()
  @IsOptional()
  @Expose()
  enable?: boolean;

  @ApiProperty({ description: "生效开始时间", required: false })
  @IsDateString()
  @IsOptional()
  @Expose()
  effectiveStart?: string;

  @ApiProperty({ description: "生效结束时间", required: false })
  @IsDateString()
  @IsOptional()
  @Expose()
  effectiveEnd?: string;

  @ApiProperty({ description: "排序", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Expose()
  sort?: number;

  @ApiProperty({
    description: "合集类型",
    required: false,
    enum: ["static", "dynamic"],
  })
  @IsIn(["static", "dynamic"])
  @IsOptional()
  @Expose()
  type?: "static" | "dynamic";

  @ApiProperty({
    description: "动态合集规则",
    required: false,
    type: WallpaperCollectionDynamicDto,
  })
  @ValidateNested()
  @Type(() => WallpaperCollectionDynamicDto)
  @IsOptional()
  @Expose()
  dynamic?: WallpaperCollectionDynamicDto;

  @ApiProperty({ description: "动态合集刷新频率（秒）", required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Expose()
  updateIntervalSec?: number;

  @ApiProperty({ description: "绑定的壁纸ID列表", required: false })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  @Expose()
  wallpapers?: string[];
}

export class WallpaperCollectionPreviewDynamicDto {
  @ApiProperty({
    description: "动态合集规则",
    type: WallpaperCollectionDynamicDto,
  })
  @ValidateNested()
  @Type(() => WallpaperCollectionDynamicDto)
  @Expose()
  dynamic: WallpaperCollectionDynamicDto;
}

export class WallpaperCollectionPublicQueryDto {
  @ApiProperty({
    description: "仅返回指定类型的壁纸",
    required: false,
    enum: ["image", "gradient", "application"],
  })
  @IsIn(["image", "gradient", "application"])
  @IsOptional()
  @Expose()
  wallpaperType?: "image" | "gradient" | "application";
}

export class WallpaperCollectionWallpapersPageDto extends PageDto {
  @ApiProperty({
    description: "仅返回指定类型的壁纸",
    required: false,
    enum: ["image", "gradient", "application"],
  })
  @IsIn(["image", "gradient", "application"])
  @IsOptional()
  @Expose()
  wallpaperType?: "image" | "gradient" | "application";
}
