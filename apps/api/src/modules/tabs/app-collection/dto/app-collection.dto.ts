import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PageDto } from 'src/public/dto/page';

export class AppCollectionForAdminDto extends PageDto {
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

export class AppCollectionDynamicDto {
  @ApiProperty({ description: '分类ID列表', required: false, type: [String] })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  @Expose()
  classifyIds?: string[];

  @ApiProperty({
    description: '排序字段',
    required: false,
    enum: ['createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  @Expose()
  sortBy?: 'createdAt' | 'updatedAt';

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

export class AppCollectionDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({ description: '简介', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({ description: '编辑短标题', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  kicker?: string;

  @ApiProperty({ description: '封面图', required: false })
  @IsObject()
  @IsOptional()
  @Expose()
  cover?: Record<string, unknown>;

  @ApiProperty({ description: '强调色', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  accentColor?: string;

  @ApiProperty({
    description: '展示布局',
    required: false,
    enum: ['story', 'compact'],
    default: 'story',
  })
  @IsString()
  @IsOptional()
  @Expose()
  layout?: 'story' | 'compact';

  @ApiProperty({ description: '是否推荐为大卡', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  @Expose()
  featured?: boolean;

  @ApiProperty({ description: '前台预览数量', required: false, default: 8 })
  @IsNumber()
  @IsOptional()
  @Expose()
  itemLimit?: number;

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
    type: AppCollectionDynamicDto,
  })
  @ValidateNested()
  @Type(() => AppCollectionDynamicDto)
  @IsOptional()
  @Expose()
  dynamic?: AppCollectionDynamicDto;

  @ApiProperty({ description: '动态合集刷新频率（秒）', required: false, default: 300 })
  @IsNumber()
  @IsOptional()
  @Expose()
  updateIntervalSec?: number;

  @ApiProperty({ description: '绑定的应用ID列表', required: false })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  @Expose()
  apps?: string[];
}

export class AppCollectionPreviewDynamicDto {
  @ApiProperty({
    description: '动态合集规则',
    required: true,
    type: AppCollectionDynamicDto,
  })
  @ValidateNested()
  @Type(() => AppCollectionDynamicDto)
  @Expose()
  dynamic: AppCollectionDynamicDto;
}

export class AppCollectionAppsPageDto extends PageDto {}
