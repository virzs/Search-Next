import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAiModelDto {
  @ApiProperty({ description: '对外模型名' })
  @IsString()
  @Expose()
  publicName: string;

  @ApiProperty({ description: '显示名称' })
  @IsString()
  @Expose()
  displayName: string;

  @ApiPropertyOptional({ description: '上下文窗口' })
  @IsOptional()
  @IsNumber()
  @Expose()
  contextWindow?: number;

  @ApiPropertyOptional({ description: '输入价格/1K tokens' })
  @IsOptional()
  @IsNumber()
  @Expose()
  inputPricePer1K?: number;

  @ApiPropertyOptional({ description: '输出价格/1K tokens' })
  @IsOptional()
  @IsNumber()
  @Expose()
  outputPricePer1K?: number;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;
}

export class UpdateAiModelDto extends PartialType(CreateAiModelDto) {}
