import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class Image2ImageDto {
  @ApiProperty({ description: '正向提示词', required: false })
  @Expose()
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiProperty({ description: '反向提示词', required: false })
  @Expose()
  @IsOptional()
  @IsString()
  negative_prompt?: string;

  @ApiProperty({ description: '输入图片URL（或Base64）' })
  @Expose()
  @IsString()
  image: string;

  @ApiProperty({ description: '引导强度（重绘强度）', default: 0.6 })
  @Expose()
  @IsNumber()
  strength: number = 0.6;

  @ApiProperty({ description: '宽度', default: 512 })
  @Expose()
  @IsInt()
  @Min(64)
  width: number = 512;

  @ApiProperty({ description: '高度', default: 512 })
  @Expose()
  @IsInt()
  @Min(64)
  height: number = 512;

  @ApiProperty({ description: '采样步数', default: 20 })
  @Expose()
  @IsInt()
  @Min(1)
  steps: number = 20;

  @ApiProperty({ description: 'CFG', default: 7 })
  @Expose()
  @IsNumber()
  cfg: number = 7;

  @ApiProperty({ description: '随机种子', required: false })
  @Expose()
  @IsOptional()
  @IsInt()
  seed?: number;

  @ApiProperty({ description: '采样器', default: 'euler' })
  @Expose()
  @IsString()
  sampler_name: string = 'euler';
}
