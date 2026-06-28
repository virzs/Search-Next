import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

/**
 * OpenAI消息DTO
 */
export class OpenAIMessageDto {
  @Expose()
  @IsString({ message: '角色必须是字符串' })
  role: 'system' | 'user' | 'assistant';

  @Expose()
  @IsOptional()
  @IsString({ message: '内容必须是字符串' })
  content?: string;
}

/**
 * OpenAI代理请求DTO
 */
export class OpenAIProxyRequestDto {
  @Expose()
  @IsString({ message: '模型名称必须是字符串' })
  model: string;

  @Expose()
  @IsArray({ message: '消息必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => OpenAIMessageDto)
  messages: OpenAIMessageDto[];

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: '温度必须是数字' })
  temperature?: number;

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: '最大令牌数必须是数字' })
  max_tokens?: number;

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: 'top_p必须是数字' })
  top_p?: number;

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: 'frequency_penalty必须是数字' })
  frequency_penalty?: number;

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: 'presence_penalty必须是数字' })
  presence_penalty?: number;

  @Expose()
  @IsOptional()
  @IsBoolean({ message: 'stream必须是布尔值' })
  stream?: boolean;

  @Expose()
  @IsOptional()
  @IsString({ message: 'user必须是字符串' })
  user?: string;
}

/**
 * OpenAI使用量DTO
 */
export class OpenAIUsageDto {
  @Expose()
  prompt_tokens: number;

  @Expose()
  completion_tokens: number;

  @Expose()
  total_tokens: number;
}

/**
 * OpenAI选择DTO
 */
export class OpenAIChoiceDto {
  @Expose()
  index: number;

  @Expose()
  message: OpenAIMessageDto;

  @Expose()
  finish_reason: string;
}

/**
 * OpenAI代理响应DTO
 */
export class OpenAIProxyResponseDto {
  @Expose()
  id: string;

  @Expose()
  object: string;

  @Expose()
  created: number;

  @Expose()
  model: string;

  @Expose()
  choices: OpenAIChoiceDto[];

  @Expose()
  usage: OpenAIUsageDto;
}

/**
 * OpenAI流式选择Delta DTO
 */
export class OpenAIStreamDeltaDto {
  @Expose()
  @IsOptional()
  role?: string;

  @Expose()
  @IsOptional()
  content?: string;
}

/**
 * OpenAI流式选择DTO
 */
export class OpenAIStreamChoiceDto {
  @Expose()
  index: number;

  @Expose()
  delta: OpenAIStreamDeltaDto;

  @Expose()
  @IsOptional()
  finish_reason?: string;
}

/**
 * OpenAI流式响应DTO
 */
export class OpenAIStreamResponseDto {
  @Expose()
  id: string;

  @Expose()
  object: string;

  @Expose()
  created: number;

  @Expose()
  model: string;

  @Expose()
  choices: OpenAIStreamChoiceDto[];

  @Expose()
  @IsOptional()
  usage?: OpenAIUsageDto;
}
