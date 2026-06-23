import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PageDto } from 'src/public/dto/page';

export class WebsiteCollectionForAdminDto extends PageDto {
  @ApiProperty({ description: '搜索标题', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;

  @ApiProperty({ description: '仅查询当前生效中的合集', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  active?: string;
}

export class WebsiteCollectionDynamicDto {
  @ApiProperty({ description: '分类ID列表', required: false, type: [String] })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  @Expose()
  classifyIds?: string[];

  @ApiProperty({ description: '标签ID列表', required: false, type: [String] })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  @Expose()
  tags?: string[];

  @ApiProperty({
    description: '排序字段',
    required: false,
    enum: ['createdAt', 'updatedAt', 'click'],
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  @Expose()
  sortBy?: 'createdAt' | 'updatedAt' | 'click';

  @ApiProperty({
    description: '排序方向',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  @Expose()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: '最大数量', required: false, default: 200 })
  @IsNumber()
  @IsOptional()
  @Expose()
  limit?: number;
}

export class WebsiteCollectionDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({ description: '简介', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({ description: '是否启用', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  @Expose()
  enable?: boolean;

  @ApiProperty({ description: '生效开始时间', required: false })
  @IsDateString()
  @IsOptional()
  @Expose()
  effectiveStart?: string;

  @ApiProperty({ description: '生效结束时间', required: false })
  @IsDateString()
  @IsOptional()
  @Expose()
  effectiveEnd?: string;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  @Expose()
  sort?: number;

  @ApiProperty({
    description: '合集类型：static=手动绑定，dynamic=按规则自动生成',
    required: false,
    enum: ['static', 'dynamic'],
    default: 'static',
  })
  @IsString()
  @IsOptional()
  @Expose()
  type?: 'static' | 'dynamic';

  @ApiProperty({
    description: '动态合集规则',
    required: false,
    type: WebsiteCollectionDynamicDto,
  })
  @ValidateNested()
  @Type(() => WebsiteCollectionDynamicDto)
  @IsOptional()
  @Expose()
  dynamic?: WebsiteCollectionDynamicDto;

  @ApiProperty({ description: '动态合集刷新频率（秒）', required: false, default: 300 })
  @IsNumber()
  @IsOptional()
  @Expose()
  updateIntervalSec?: number;

  @ApiProperty({ description: '绑定的网站ID列表', required: false })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  @Expose()
  websites?: string[];
}

export class WebsiteCollectionPreviewDynamicDto {
  @ApiProperty({
    description: '动态合集规则',
    required: true,
    type: WebsiteCollectionDynamicDto,
  })
  @ValidateNested()
  @Type(() => WebsiteCollectionDynamicDto)
  @Expose()
  dynamic: WebsiteCollectionDynamicDto;
}

export class WebsiteCollectionWebsitesPageDto extends PageDto {}
