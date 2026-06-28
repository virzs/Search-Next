import { Expose } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsObject,
  IsNumber,
  IsBoolean,
} from 'class-validator';

/**
 * AI服务调用请求DTO
 */
export class AiServiceCallDto {
  @Expose()
  @IsString()
  model: string; // 模型名称

  @Expose()
  @IsString()
  prompt: string; // 提示词

  @Expose()
  @IsOptional()
  @IsString()
  presetId?: string; // 预设ID（可选）

  @Expose()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>; // 额外配置（如temperature、max_tokens等）
}

/**
 * AI服务调用响应DTO
 */
export class AiServiceCallResponseDto {
  @Expose()
  success: boolean; // 调用是否成功

  @Expose()
  @IsOptional()
  @IsString()
  response?: string; // AI响应内容

  @Expose()
  @IsOptional()
  @IsNumber()
  tokensUsed?: number; // 使用的token数量

  @Expose()
  @IsNumber()
  responseTime: number; // 响应时间（毫秒）

  @Expose()
  @IsString()
  model: string; // 使用的模型

  @Expose()
  @IsString()
  provider: string; // 使用的服务商

  @Expose()
  @IsOptional()
  @IsString()
  error?: string; // 错误信息（如果失败）

  @Expose()
  @IsOptional()
  @IsObject()
  configUsed?: Record<string, any>; // 实际使用的配置
}

/**
 * AI服务流式调用配置DTO
 */
export class AiServiceStreamConfigDto {
  @Expose()
  @IsString()
  model: string; // 模型名称

  @Expose()
  @IsString()
  prompt: string; // 提示词

  @Expose()
  @IsOptional()
  @IsString()
  presetId?: string; // 预设ID（可选）

  @Expose()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>; // 额外配置

  @Expose()
  @IsOptional()
  @IsBoolean()
  enableStream?: boolean; // 是否启用流式传输，默认false
}
