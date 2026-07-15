import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class TreeDto {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  @IsOptional()
  @Expose()
  name: string;

  @ApiProperty({ description: '搜索关键词', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;

  @ApiProperty({ description: '是否只返回树展示必要字段', required: false })
  @IsOptional()
  @Expose()
  simple?: boolean;

  @ApiProperty({ description: '是否只返回生效权限', required: false })
  @IsOptional()
  @Expose()
  activeOnly?: boolean;
}
