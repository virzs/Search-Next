import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageDto } from 'src/public/dto/page';

export class TagForAdminDto extends PageDto {
  @ApiProperty({ description: '搜索关键词', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsBoolean()
  @IsOptional()
  @Expose()
  enable?: boolean;
}

export class TagForUserDto extends PageDto {
  @ApiProperty({ description: '搜索关键词', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;
}

export class TagDto {
  @ApiProperty({ description: '标签名称' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: '标签描述', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  @Expose()
  sort?: number;

  @ApiProperty({ description: '是否启用', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  @Expose()
  enable?: boolean;

  @ApiProperty({ description: '关联的网站ID列表', required: false })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  @Expose()
  websites?: string[];
}

export class UpdateTagDto extends TagDto {
  @ApiProperty({ description: '标签ID' })
  @IsMongoId()
  @Expose()
  id: string;
}

export class TagWebsiteRelationDto {
  @ApiProperty({ description: '标签ID' })
  @IsMongoId()
  @Expose()
  tagId: string;

  @ApiProperty({ description: '网站ID' })
  @IsMongoId()
  @Expose()
  websiteId: string;
}

export class BatchUpdateTagStatusDto {
  @ApiProperty({ description: '标签ID列表' })
  @IsMongoId({ each: true })
  @IsArray()
  @Expose()
  ids: string[];

  @ApiProperty({ description: '是否启用' })
  @IsBoolean()
  @Expose()
  enable: boolean;
}

export class QuickCreateTagDto {
  @ApiProperty({ description: '标签名称' })
  @IsString()
  @Expose()
  name: string;
}

export class SearchTagDto {
  @ApiProperty({ description: '搜索关键词', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;
}
