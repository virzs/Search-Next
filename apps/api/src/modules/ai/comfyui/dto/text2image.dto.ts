import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class Text2ImageDto {
  @ApiProperty({ description: '正向提示词' })
  @Expose()
  @IsString()
  prompt: string;

  @ApiProperty({ description: '反向提示词', required: false })
  @Expose()
  @IsOptional()
  @IsString()
  negative_prompt?: string;

  @ApiProperty({ description: '宽度', default: 512 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value === undefined ? 512 : value))
  @IsInt()
  @Min(64)
  width: number = 512;

  @ApiProperty({ description: '高度', default: 512 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value === undefined ? 512 : value))
  @IsInt()
  @Min(64)
  height: number = 512;

  @ApiProperty({ description: '采样步数', default: 20 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value === undefined ? 20 : value))
  @IsInt()
  @Min(1)
  steps: number = 20;

  @ApiProperty({ description: 'CFG', default: 7 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value === undefined ? 7 : value))
  @IsNumber()
  cfg: number = 7;

  @ApiProperty({ description: '随机种子', required: false })
  @Expose()
  @IsOptional()
  @IsInt()
  seed?: number;

  @ApiProperty({ description: '采样器', default: 'euler' })
  @Expose()
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 'euler' : value))
  @IsString()
  sampler_name: string = 'euler';
}
