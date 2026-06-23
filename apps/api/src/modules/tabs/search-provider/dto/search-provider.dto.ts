import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsUrl,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 搜索提供商配置DTO
export class SearchProviderConfigDto {
  @ApiPropertyOptional({ description: 'API密钥' })
  @IsOptional()
  @IsString()
  @Expose()
  apiKey?: string;

  @ApiPropertyOptional({ description: '基础URL' })
  @IsOptional()
  @IsUrl()
  @Expose()
  baseUrl?: string;

  @ApiPropertyOptional({
    description: '请求超时时间(毫秒)',
    minimum: 1000,
    maximum: 60000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(60000)
  @Expose()
  timeout?: number;

  @ApiPropertyOptional({
    description: '最大结果数量',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Expose()
  maxResults?: number;

  @ApiPropertyOptional({ description: '默认国家代码' })
  @IsOptional()
  @IsString()
  @Expose()
  defaultCountry?: string;

  @ApiPropertyOptional({ description: '默认语言代码' })
  @IsOptional()
  @IsString()
  @Expose()
  defaultLanguage?: string;

  @ApiPropertyOptional({ description: '自定义请求头' })
  @IsOptional()
  @IsObject()
  @Expose()
  customHeaders?: Record<string, string>;

  @ApiPropertyOptional({ description: '自定义参数' })
  @IsOptional()
  @IsObject()
  @Expose()
  customParams?: Record<string, any>;
}

// 创建搜索提供商DTO
export class CreateSearchProviderDto {
  @ApiProperty({ description: '提供商名称（唯一标识）' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: '显示名称' })
  @IsString()
  @Expose()
  displayName: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiProperty({ description: 'API端点URL' })
  @IsUrl()
  @Expose()
  apiEndpoint: string;

  @ApiPropertyOptional({ description: '配置信息' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchProviderConfigDto)
  @Expose()
  config?: SearchProviderConfigDto;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: '是否为默认提供商', default: false })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: '优先级',
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Expose()
  priority?: number;
}

// 更新搜索提供商DTO
export class UpdateSearchProviderDto {
  @ApiPropertyOptional({ description: '显示名称' })
  @IsOptional()
  @IsString()
  @Expose()
  displayName?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: 'API端点URL' })
  @IsOptional()
  @IsUrl()
  @Expose()
  apiEndpoint?: string;

  @ApiPropertyOptional({ description: '配置信息' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchProviderConfigDto)
  @Expose()
  config?: SearchProviderConfigDto;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: '是否为默认提供商' })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '优先级', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Expose()
  priority?: number;
}

// 搜索提供商响应DTO
export class SearchProviderResponseDto {
  @ApiProperty({ description: 'ID' })
  @Expose()
  _id: string;

  @ApiProperty({ description: '提供商名称' })
  @Expose()
  name: string;

  @ApiProperty({ description: '显示名称' })
  @Expose()
  displayName: string;

  @ApiPropertyOptional({ description: '描述' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'API端点URL' })
  @Expose()
  apiEndpoint: string;

  @ApiProperty({ description: '配置信息' })
  @Expose()
  config: SearchProviderConfigDto;

  @ApiProperty({ description: '是否启用' })
  @Expose()
  isEnabled: boolean;

  @ApiProperty({ description: '是否为默认提供商' })
  @Expose()
  isDefault: boolean;

  @ApiProperty({ description: '优先级' })
  @Expose()
  priority: number;

  @ApiPropertyOptional({ description: '最后使用时间' })
  @Expose()
  lastUsedAt?: Date;

  @ApiProperty({ description: '使用次数' })
  @Expose()
  usageCount: number;

  @ApiProperty({ description: '成功次数' })
  @Expose()
  successCount: number;

  @ApiProperty({ description: '错误次数' })
  @Expose()
  errorCount: number;

  @ApiProperty({ description: '创建时间' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @Expose()
  updatedAt: Date;
}

// 设置默认提供商DTO
export class SetDefaultProviderDto {
  @ApiProperty({ description: '提供商ID' })
  @IsString()
  @Expose()
  providerId: string;
}
