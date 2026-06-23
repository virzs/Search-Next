import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class WebsiteClassifyDto {
  @ApiProperty({ description: '名称' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  @IsOptional()
  @Expose()
  description: string;

  @ApiProperty({ description: '图标' })
  @IsObject()
  @IsOptional()
  @Expose()
  icon: string;

  @ApiProperty({ description: '排序' })
  @IsNumber()
  @IsOptional()
  @Expose()
  sort: number;

  @ApiProperty({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  @Expose()
  enable: boolean;

  @ApiProperty({ description: '父级分类' })
  @IsMongoId()
  @IsOptional()
  @Expose()
  parent: string;
}
