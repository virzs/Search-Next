import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Resource } from 'src/modules/resource/schemas/resource';
import { PageDto } from 'src/public/dto/page';

export class SystemNoticeForAdminDto extends PageDto {
  @ApiProperty({ description: '模块Key（如 tabs）', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  key?: string;

  @ApiProperty({ description: '搜索标题', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;

  @ApiProperty({ description: '仅查询当前生效中的通知', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  active?: string;
}

export class SystemNoticeDto {
  @ApiProperty({ description: '模块Key（如 tabs）' })
  @IsString()
  @Expose()
  key: string;

  @ApiProperty({ description: '标题' })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({ description: '内容' })
  @IsString()
  @Expose()
  content: string;

  @ApiProperty({ description: '封面', type: Resource, required: false })
  @IsObject()
  @IsOptional()
  @Expose()
  cover?: Resource;

  @ApiProperty({ description: '生效开始时间', required: false })
  @IsDateString()
  @IsOptional()
  @Expose()
  effectiveStart?: string;

  @ApiProperty({ description: '生效结束时间', required: false })
  @IsDateString()
  @IsOptional()
  @Expose()
  effectiveEnd?: string;

  @ApiProperty({ description: '是否启用', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  @Expose()
  enable?: boolean;
}

export class SystemNoticePublicQueryDto {
  @ApiProperty({ description: '模块Key（如 tabs）' })
  @IsString()
  @Expose()
  key: string;
}
