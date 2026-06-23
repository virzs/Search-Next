import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class TreeDto {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  @IsOptional()
  @Expose()
  name: string;
}
