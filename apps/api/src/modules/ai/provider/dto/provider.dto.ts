import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({ description: '服务商名称（唯一标识）' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: '服务商显示名称' })
  @IsString()
  @Expose()
  displayName: string;

  @ApiPropertyOptional({ description: '服务商协议类型', default: 'openai-compatible' })
  @IsOptional()
  @IsString()
  @Expose()
  type?: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '服务商描述' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: 'OpenAI-compatible Base URL' })
  @IsOptional()
  @IsString()
  @Expose()
  baseUrl?: string;

  @ApiProperty({ description: '上游 API Key' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  apiKey: string;

  @ApiPropertyOptional({ description: '测试连接使用的模型；不填则使用上游模型列表第一个' })
  @IsOptional()
  @IsString()
  @Expose()
  testModel?: string;

  @ApiPropertyOptional({ description: '优先级，越大越优先', default: 100 })
  @IsOptional()
  @IsNumber()
  @Expose()
  priority?: number;

  @ApiPropertyOptional({ description: '请求超时时间', default: 60000 })
  @IsOptional()
  @IsNumber()
  @Expose()
  timeoutMs?: number;
}

export class UpdateProviderDto extends PartialType(CreateProviderDto) {}

export class ProviderModelDto {
  @ApiProperty({ description: '公共模型ID' })
  @IsString()
  @Expose()
  publicModel: string;

  @ApiProperty({ description: '上游真实模型名' })
  @IsString()
  @Expose()
  upstreamModel: string;

  @ApiPropertyOptional({ description: '优先级，越大越优先', default: 100 })
  @IsOptional()
  @IsNumber()
  @Expose()
  priority?: number;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '模型标签', default: 'proxy' })
  @IsOptional()
  @IsString()
  @Expose()
  tag?: 'official' | 'proxy';

  @ApiPropertyOptional({ description: '上游输入成本/1K tokens' })
  @IsOptional()
  @IsNumber()
  @Expose()
  costInputPricePer1K?: number;

  @ApiPropertyOptional({ description: '上游输出成本/1K tokens' })
  @IsOptional()
  @IsNumber()
  @Expose()
  costOutputPricePer1K?: number;
}

export class UpdateProviderModelDto extends PartialType(ProviderModelDto) {}
