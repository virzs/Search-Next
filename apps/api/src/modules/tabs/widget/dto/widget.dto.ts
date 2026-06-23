import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type, Transform } from 'class-transformer';
import {
  IsMongoId,
  IsOptional,
  IsString,
  IsArray,
  Min,
  IsNumber,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { PageDto } from 'src/public/dto/page';

export class WidgetDto {
  @ApiProperty({ description: '小组件名称' })
  @IsString()
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '简介' })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: '预览图资源ID列表', isArray: true })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (value == null) return undefined;
    const toId = (v: any) =>
      typeof v === 'string' ? v : v?._id ?? v?.id ?? v;
    const arr = Array.isArray(value) ? value : [value];
    return arr.map(toId);
  })
  @IsMongoId({ each: true })
  @Expose()
  previewImages?: string[];

  @ApiPropertyOptional({ description: '文件资源ID列表', isArray: true })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (value == null) return undefined;
    const toId = (v: any) =>
      typeof v === 'string' ? v : v?._id ?? v?.id ?? v;
    const arr = Array.isArray(value) ? value : [value];
    return arr.map(toId);
  })
  @IsMongoId({ each: true })
  @Expose()
  files?: string[];

  @ApiProperty({ description: '入口文件名称' })
  @IsString()
  @Expose()
  entryFileName: string;

  @ApiPropertyOptional({ description: '文件上传目录名' })
  @IsOptional()
  @IsString()
  @Expose()
  dir?: string;

  @ApiPropertyOptional({ description: '图标资源ID' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return typeof value === 'string' ? value : value?._id ?? value?.id ?? value;
  })
  @IsMongoId()
  @Expose()
  icon?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsMongoId()
  @Expose()
  classify?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  @Expose()
  enable?: boolean;

  // 小组件版本号
  @ApiPropertyOptional({ description: '版本号' })
  @IsOptional()
  @IsString()
  @Expose()
  version?: string;

  // 小组件作者
  @ApiPropertyOptional({ description: '作者' })
  @IsOptional()
  @IsString()
  @Expose()
  author?: string;

  // 小组件支持的尺寸配置列表
  @ApiPropertyOptional({ description: '尺寸配置列表', type: 'array' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Expose()
  sizeConfigs?: Array<{ row: number; col: number; name: string; id: string }>;

  // 默认尺寸ID
  @ApiPropertyOptional({ description: '默认尺寸ID' })
  @IsOptional()
  @IsString()
  @Expose()
  defaultSizeId?: string;

  // 是否支持图标模式
  @ApiPropertyOptional({ description: '是否支持图标模式' })
  @IsOptional()
  @IsBoolean()
  @Expose()
  supportIconMode?: boolean;

  // 标签列表
  @ApiPropertyOptional({ description: '标签列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Expose()
  tags?: string[];

  // 排序值，越小越靠前
  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose()
  sortOrder?: number;

  // 小组件设置表单 schema，以 antd 表单格式描述可配置项
  @ApiPropertyOptional({ description: '设置表单Schema', type: 'array' })
  @IsOptional()
  @IsArray()
  @Expose()
  settingsSchema?: Array<Record<string, any>>;
}

export class WidgetQueryDto extends PageDto {
  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsMongoId()
  @Expose()
  classify?: string;

  @ApiPropertyOptional({ description: '搜索名称关键词' })
  @IsOptional()
  @IsString()
  @Expose()
  search?: string;

  // 按单个标签进行筛选
  @ApiPropertyOptional({ description: '标签筛选' })
  @IsOptional()
  @IsString()
  @Expose()
  tag?: string;

  @ApiPropertyOptional({ description: '排序（默认为创建时间倒序）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose()
  sortOrder?: number;
}
