import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AdjustAiBalanceDto {
  @ApiProperty({ description: '积分调整值，正数充值，负数扣减' })
  @IsNumber()
  @Expose()
  integral: number;

  @ApiPropertyOptional({ description: '调整原因' })
  @IsOptional()
  @IsString()
  @Expose()
  reason?: string;
}
