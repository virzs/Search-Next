import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreateAiPresetDto {
  @ApiProperty({ description: '配置名称' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: '系统提示词' })
  @IsString()
  @Expose()
  systemPrompt: string;

  @ApiPropertyOptional({ description: '用户提示词模板' })
  @IsOptional()
  @IsString()
  @Expose()
  userPrompt?: string;

  @ApiPropertyOptional({ description: '模型温度' })
  @IsOptional()
  @Expose()
  temperature?: number;

  @ApiPropertyOptional({ description: '最大token数' })
  @IsOptional()
  @Expose()
  maxTokens?: number;

  @ApiPropertyOptional({ description: '最大上下文长度' })
  @IsOptional()
  @Expose()
  maxContext?: number;

  @ApiPropertyOptional({ description: '是否流式输出' })
  @IsOptional()
  @IsBoolean()
  @Expose()
  stream?: boolean;

  @ApiPropertyOptional({ description: '额外配置参数' })
  @IsOptional()
  @IsObject()
  @Expose()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '描述信息' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Expose()
  tags?: string[];
}

export class UpdateAiPresetDto extends CreateAiPresetDto {}
