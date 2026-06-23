import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Platform } from '../schemas/version';

export class VersionDto {
  @ApiProperty({ description: '版本号' })
  @IsString()
  @IsNotEmpty({ message: '版本号不能为空' })
  @Expose()
  version: string;

  @ApiProperty({ description: '发布平台' })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Expose()
  platforms: Platform[];

  @ApiProperty({ description: '更新内容' })
  @IsString()
  @IsNotEmpty({ message: '更新内容不能为空' })
  @Expose()
  content: string;

  @ApiProperty({ description: '发布时间' })
  @IsDateString()
  @IsOptional()
  @Expose()
  releaseTime: string;
}
