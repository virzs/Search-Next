import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Expose } from 'class-transformer';

export class AiSearchDto {
  @Expose()
  @IsString()
  q: string; // 搜索查询

  @Expose()
  @IsOptional()
  @IsString()
  gl?: string = 'cn'; // 搜索国家，默认中国

  @Expose()
  @IsOptional()
  @IsString()
  hl?: string = 'zh-cn'; // 搜索语言，默认中文

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  num?: number = 10; // 结果数量，默认10

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1; // 页码，默认第1页

  @Expose()
  @IsOptional()
  @IsString()
  searchProvider?: string; // 搜索提供商，可选

  @Expose()
  @IsOptional()
  @IsString()
  aiProvider?: string; // AI服务商，可选

  @Expose()
  @IsOptional()
  @IsString()
  aiModel?: string; // AI模型，可选
}

export class AiSearchResponseDto {
  @Expose()
  query: string; // 搜索查询

  @Expose()
  searchResults: Record<string, any>; // 第三方搜索API返回的完整数据

  @Expose()
  aiAnalysis: string; // AI分析结果

  @Expose()
  aiProvider: string; // 使用的AI服务商

  @Expose()
  aiModel: string; // 使用的AI模型

  @Expose()
  tokensUsed: number; // AI调用消耗的token数量

  @Expose()
  responseTime: number; // 总响应时间（毫秒）

  @Expose()
  status: string; // 处理状态

  @Expose()
  errorMessage?: string; // 错误信息（如果有）

  @Expose()
  recordId: string; // 搜索记录ID
}