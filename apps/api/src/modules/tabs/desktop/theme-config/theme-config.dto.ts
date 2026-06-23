import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  IsMongoId,
} from 'class-validator';

// 主题配置相关DTO
export class CreateThemeConfigDto {
  @ApiProperty({ description: '主题名称', example: '经典主题' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: '主题描述',
    example: '支持浅色和深色模式的经典主题',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Expose()
  description?: string;

  @ApiProperty({
    description: '浅色主题配置JSON数据',
    example: {
      colors: { primary: '#1890ff', background: '#ffffff', text: '#000000' },
      layout: { sidebar: 'light' },
    },
  })
  @IsNotEmpty()
  @Expose()
  lightConfig: any;

  @ApiPropertyOptional({
    description: '深色主题配置JSON数据（可选）',
    example: {
      colors: { primary: '#1890ff', background: '#001529', text: '#ffffff' },
      layout: { sidebar: 'dark' },
    },
  })
  @IsOptional()
  @Expose()
  darkConfig?: any;

  @ApiPropertyOptional({
    description: '预览图资源ID数组',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @Expose()
  previewImages?: string[];

  @ApiPropertyOptional({
    description: '主题分类ID',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsMongoId()
  @Expose()
  categoryId?: string;

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

export class UpdateThemeConfigDto extends CreateThemeConfigDto {}

// 查询DTO
export class ThemeConfigQueryDto {
  @ApiPropertyOptional({ description: '关键词搜索', example: '深色' })
  @IsOptional()
  @IsString()
  @Expose()
  q?: string;

  @ApiPropertyOptional({ description: '是否启用', example: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '主题分类ID',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsMongoId()
  @Expose()
  categoryId?: string;
}

export class ActiveThemeConfigQueryDto {
  @ApiPropertyOptional({
    description: '主题分类ID',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsMongoId()
  @Expose()
  categoryId?: string;
}
