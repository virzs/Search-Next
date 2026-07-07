import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsObject,
  IsOptional,
  IsRgbColor,
  IsString,
  IsUrl,
} from 'class-validator';
import { PageDto } from 'src/public/dto/page';

const toOptionalBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export class WebsiteForAdminDto extends PageDto {
  @ApiProperty({ description: '所属分类' })
  @IsString()
  @IsOptional()
  @Expose()
  classifyIds: string;

  @ApiProperty({ description: '搜索', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(toOptionalBoolean)
  @Expose()
  enable?: boolean;
}

export class WebsitesForUserDto extends PageDto {
  @ApiProperty({ description: '分类' })
  @IsMongoId()
  @Expose()
  classify: string;

  @ApiProperty({ description: '标签' })
  @IsMongoId({ each: true })
  @IsOptional()
  @Expose()
  tags: string[];

  @ApiProperty({ description: '搜索' })
  @IsString()
  @IsOptional()
  @Expose()
  search: string;
}

export class WebsiteDto {
  @ApiProperty({ description: '名称' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL' })
  @IsUrl()
  @Expose()
  url: string;

  @ApiProperty({ description: '图标' })
  @IsObject()
  @IsOptional()
  @Expose()
  icon: string;

  @ApiProperty({ description: '手动编辑图标' })
  @IsObject()
  @IsOptional()
  @Expose()
  iconEdited: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  @IsOptional()
  @Expose()
  description: string;

  @ApiProperty({ description: '分类' })
  @IsMongoId()
  @IsOptional()
  @Expose()
  classify: string;

  @ApiProperty({ description: '标签' })
  @IsMongoId({ each: true })
  @IsOptional()
  @Expose()
  tags: string[];

  @ApiProperty({ description: '主题色' })
  @IsRgbColor()
  @IsOptional()
  @Expose()
  themeColor: string;
}

export class ParseWebsiteDto {
  @ApiProperty({ description: 'URL' })
  @IsUrl()
  @Expose()
  url: string;

  @ApiProperty({ description: '是否忽略缓存' })
  @IsBoolean()
  @IsOptional()
  @Expose()
  ignoreCache: boolean;
}

export class UpdateWebsitePublicDto {
  @ApiProperty({ description: 'IDS' })
  @IsMongoId({ each: true })
  @Expose()
  ids: string[];

  @ApiProperty({ description: '是否公开' })
  @IsBoolean()
  @Expose()
  isPublic: boolean;
}

export class WebsitesPublicDto extends PageDto {
  @ApiProperty({ description: '分类' })
  @IsMongoId()
  @IsOptional()
  @Expose()
  classify: string;

  @ApiProperty({ description: '标签' })
  @IsMongoId({ each: true })
  @IsOptional()
  @Expose()
  tags: string[];

  @ApiProperty({ description: '搜索' })
  @IsString()
  @IsOptional()
  @Expose()
  search: string;
}
