import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class IntegralDto {
  @ApiProperty({ description: '用户ID' })
  @IsMongoId()
  @Expose()
  user: string;

  @ApiProperty({ description: '积分' })
  @IsNumber()
  @Expose()
  integral: number;

  @ApiProperty({ description: '原因' })
  @IsOptional()
  @IsString()
  @Expose()
  reason: string;
}
