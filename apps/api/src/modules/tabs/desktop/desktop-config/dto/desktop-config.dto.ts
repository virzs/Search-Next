import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  Min,
  IsArray,
  ValidateNested,
  IsObject,
  IsIn,
  ValidateIf,
} from 'class-validator';

export class DesktopConfigWallpaperDto {
  @ApiProperty({
    description: '壁纸类型',
    example: 'image',
    enum: ['image', 'gradient', 'none'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['image', 'gradient', 'none'])
  @Expose()
  type: 'image' | 'gradient' | 'none';

  @ApiPropertyOptional({
    description: '图片地址（type=image 时必填）',
    example: 'https://r2.virs.xyz/wallpaper/example.jpg',
  })
  @ValidateIf((o: DesktopConfigWallpaperDto) => o.type === 'image')
  @IsString()
  @IsNotEmpty()
  @Expose()
  url?: string;

  @ApiPropertyOptional({
    description: '渐变CSS（type=gradient 时必填）',
    example:
      'radial-gradient(80% 70% at 15% 20%, rgba(0, 199, 190, 0.70) 0%, rgba(0, 0, 0, 0) 65%)',
  })
  @ValidateIf((o: DesktopConfigWallpaperDto) => o.type === 'gradient')
  @IsString()
  @IsNotEmpty()
  @Expose()
  css?: string;

  @ApiProperty({ description: '壁纸名称', example: '无' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;
}

export class DesktopConfigPersonalizationDto {
  @ApiProperty({ description: '主题ID', example: '68e8caf254ba956279c9ca7c' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  themeId: string;

  @ApiProperty({
    description: '壁纸设置',
    type: DesktopConfigWallpaperDto,
    example: {
      type: 'none',
      name: '无',
    },
  })
  @ValidateNested()
  @Type(() => DesktopConfigWallpaperDto)
  @Expose()
  wallpaper: DesktopConfigWallpaperDto;
}

export class DesktopConfigListItemDto {
  @ApiProperty({ description: '列表项唯一ID', example: 'page_1' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiProperty({ description: '列表项类型', example: 'page' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  type: string;

  @ApiPropertyOptional({
    description: '列表项配置',
    example: { sizeId: '2x2' },
  })
  @IsOptional()
  @IsObject()
  @Expose()
  config?: Record<string, any>;

  @ApiPropertyOptional({
    description: '列表项数据',
    example: { title: '首页' },
  })
  @IsOptional()
  @IsObject()
  @Expose()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: '子节点列表（可嵌套）',
    type: [DesktopConfigListItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DesktopConfigListItemDto)
  @Expose()
  children?: DesktopConfigListItemDto[];
}

export class DesktopConfigJsonDto {
  @ApiPropertyOptional({
    description: '个性化配置',
    type: DesktopConfigPersonalizationDto,
    example: {
      themeId: '68e8caf254ba956279c9ca7c',
      wallpaper: {
        type: 'image',
        url: 'https://r2.virs.xyz/wallpaper/example.jpg',
        name: '冬日里的科赫尔湖，德国巴伐利亚州',
      },
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DesktopConfigPersonalizationDto)
  @Expose()
  personalization?: DesktopConfigPersonalizationDto;

  @ApiProperty({
    description: '配置项列表（顶层通常为 type:"page" 的节点）',
    type: [DesktopConfigListItemDto],
    example: [
      {
        id: 'page_1',
        type: 'page',
        config: { sizeId: '2x2' },
        data: { title: '首页' },
        children: [{ id: 'app_1', type: 'app:todo', data: { name: 'todo' } }],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DesktopConfigListItemDto)
  @Expose()
  list: DesktopConfigListItemDto[];
}

// 管理员桌面配置相关DTO
export class CreateAdminDesktopConfigDto {
  @ApiProperty({ description: '配置名称', example: '默认桌面配置' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: '配置描述',
    example: '系统默认的桌面配置',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Expose()
  description?: string;

  @ApiProperty({
    description: '桌面配置JSON数据',
    example: { list: [{ type: 'page' }] },
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DesktopConfigJsonDto)
  @Expose()
  config: DesktopConfigJsonDto;

  @ApiPropertyOptional({ description: '是否为当前生效的配置', example: false })
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

export class UpdateAdminDesktopConfigDto extends CreateAdminDesktopConfigDto {}

export class SetActiveAdminConfigDto {
  @ApiProperty({ description: '是否激活', example: true })
  @IsBoolean()
  @Expose()
  isActive: boolean;
}

// 用户桌面配置相关DTO
export class CreateUserDesktopConfigDto {
  @ApiProperty({ description: '配置名称', example: '我的桌面配置' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: '配置描述',
    example: '个人定制的桌面配置',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Expose()
  description?: string;

  @ApiProperty({
    description: '桌面配置JSON数据',
    example: { list: [{ type: 'page' }] },
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DesktopConfigJsonDto)
  @Expose()
  config: DesktopConfigJsonDto;

  @ApiPropertyOptional({ description: '是否为默认配置', example: false })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose()
  sortOrder?: number;
}

export class UpdateUserDesktopConfigDto extends CreateUserDesktopConfigDto {}

export class SetDefaultUserConfigDto {
  @ApiProperty({ description: '是否设为默认', example: true })
  @IsBoolean()
  @Expose()
  isDefault: boolean;
}

// 查询DTO
export class DesktopConfigQueryDto {
  @ApiPropertyOptional({ description: '关键词搜索', example: '默认' })
  @IsOptional()
  @IsString()
  @Expose()
  q?: string;

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isActive?: boolean;
}
