import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'refreshToken' })
  @IsString()
  @Expose()
  refreshToken: string;
}
