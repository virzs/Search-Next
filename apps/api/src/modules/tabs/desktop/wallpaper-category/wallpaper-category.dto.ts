import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateWallpaperCategoryDto {
  @ApiProperty({ description: '分类名称', example: '风景' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '分类描述', example: '风景类壁纸' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: '是否启用', example: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose()
  sortOrder?: number;
}

export class UpdateWallpaperCategoryDto extends CreateWallpaperCategoryDto {}

export class WallpaperCategoryQueryDto {
  @ApiPropertyOptional({ description: '关键词搜索', example: '风景' })
  @IsOptional()
  @IsString()
  @Expose()
  q?: string;

  @ApiPropertyOptional({ description: '是否启用', example: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isActive?: boolean;
}
