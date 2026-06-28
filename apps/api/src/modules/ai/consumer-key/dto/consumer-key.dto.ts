import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateConsumerKeyDto {
  @ApiProperty({ description: 'Key 名称' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: '所属用户ID，调用时扣该用户积分' })
  @IsString()
  @Expose()
  ownerUser: string;

  @ApiPropertyOptional({ description: '允许调用的模型ID；为空表示全部启用模型' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Expose()
  allowedModels?: string[];

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '过期时间' })
  @IsOptional()
  @IsDateString()
  @Expose()
  expiresAt?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;
}

export class UpdateConsumerKeyDto extends PartialType(CreateConsumerKeyDto) {}
