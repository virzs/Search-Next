import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({ description: '服务商名称（唯一标识）' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: '服务商显示名称' })
  @IsString()
  @Expose()
  displayName: string;

  @ApiProperty({ description: 'API基础地址' })
  @IsString()
  @Expose()
  baseUrl: string;

  @ApiPropertyOptional({ description: 'API密钥' })
  @IsOptional()
  @IsString()
  @Expose()
  apiKey?: string;

  @ApiProperty({ description: '默认模型' })
  @IsString()
  @Expose()
  defaultModel: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '支持的模型列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Expose()
  supportedModels?: string[];

  @ApiPropertyOptional({ description: '服务商描述' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;
}

export class UpdateProviderDto extends CreateProviderDto {}
