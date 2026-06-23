import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsMongoId,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { PageDto } from 'src/public/dto/page';

export class WidgetClassifyDto {
  @ApiProperty({ description: '分类名称' })
  @IsString()
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '分类简介' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: '图标资源ID' })
  @IsOptional()
  @IsMongoId()
  @Expose()
  icon?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  @Expose()
  enable?: boolean;
}

export class WidgetClassifyQueryDto extends PageDto {
  @ApiPropertyOptional({ description: '搜索名称关键词' })
  @IsOptional()
  @IsString()
  @Expose()
  search?: string;
}
