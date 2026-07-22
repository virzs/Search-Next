import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
  IsUrl,
  MaxLength,
  Min,
} from "class-validator";
import { PageDto } from "src/public/dto/page";

export class CreateWallpaperDto {
  @ApiProperty({ description: "资源ID（先通过 /resource 上传）" })
  @IsMongoId()
  @IsNotEmpty()
  @Expose()
  image: string;

  @ApiPropertyOptional({ description: "壁纸名称" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Expose()
  name?: string;

  @ApiPropertyOptional({ description: "描述" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: "作者" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Expose()
  author?: string;

  @ApiPropertyOptional({ description: "项目 URL" })
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  @MaxLength(500)
  @Expose()
  url?: string;

  @ApiPropertyOptional({ description: "分类ID（仅自行上传壁纸支持）" })
  @IsOptional()
  @IsMongoId()
  @Expose()
  categoryId?: string;

  @ApiPropertyOptional({ description: "是否启用", example: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "排序", example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose()
  sortOrder?: number;
}

export class UpdateWallpaperDto extends PartialType(CreateWallpaperDto) {}

export class GradientWallpaperDto {
  @ApiProperty({ description: "壁纸名称" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  name: string;

  @ApiProperty({ description: "CSS 渐变背景" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  @Expose()
  css: string;

  @ApiPropertyOptional({ description: "描述" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: "作者" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Expose()
  author?: string;

  @ApiPropertyOptional({ description: "项目 URL" })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsUrl({ protocols: ["https"], require_protocol: true })
  @MaxLength(500)
  @Expose()
  url?: string;

  @ApiPropertyOptional({ description: "分类ID" })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? null : value))
  @IsMongoId()
  @Expose()
  categoryId?: string | null;

  @ApiPropertyOptional({ description: "是否启用", example: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "排序", example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose()
  sortOrder?: number;
}

export class UpdateGradientWallpaperDto extends PartialType(
  GradientWallpaperDto,
) {}

export class ApplicationWallpaperDto {
  @ApiPropertyOptional({ description: "壁纸名称" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Expose()
  name?: string;

  @ApiPropertyOptional({ description: "描述" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: "作者" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Expose()
  author?: string;

  @ApiPropertyOptional({ description: "项目 URL" })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsUrl({ protocols: ["https"], require_protocol: true })
  @MaxLength(500)
  @Expose()
  url?: string;

  @ApiPropertyOptional({ description: "分类ID" })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? null : value))
  @IsMongoId()
  @Expose()
  categoryId?: string | null;

  @ApiPropertyOptional({ description: "是否启用", example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return value;
  })
  @IsBoolean()
  @Expose()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "排序", example: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === "" ? undefined : Number(value),
  )
  @IsNumber()
  @Min(0)
  @Expose()
  sortOrder?: number;
}

export class WallpaperQueryDto {
  @ApiPropertyOptional({ description: "关键词搜索", example: "海边" })
  @IsOptional()
  @IsString()
  @Expose()
  q?: string;

  @ApiPropertyOptional({ description: "是否启用", example: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "分类ID" })
  @IsOptional()
  @IsMongoId()
  @Expose()
  categoryId?: string;

  @ApiPropertyOptional({
    description: "壁纸类型",
    enum: ["image", "gradient", "application"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["image", "gradient", "application"])
  @Expose()
  type?: "image" | "gradient" | "application";
}

export class WallpaperGroupQueryDto extends PageDto {
  @ApiPropertyOptional({ description: "分类ID（只返回该分类分组）" })
  @IsOptional()
  @IsMongoId()
  @Expose()
  categoryId?: string;

  @ApiPropertyOptional({ description: "每个分组返回的壁纸数量", default: 8 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Expose()
  groupSize?: number;

  @ApiPropertyOptional({
    description: "壁纸类型",
    enum: ["image", "gradient", "application"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["image", "gradient", "application"])
  @Expose()
  type?: "image" | "gradient" | "application";
}
