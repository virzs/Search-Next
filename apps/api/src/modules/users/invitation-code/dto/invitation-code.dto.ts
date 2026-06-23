import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class InvitationCodeDto {
  @ApiProperty({ description: '默认角色' })
  @IsMongoId({ each: true })
  @IsOptional()
  @Expose()
  roles: string[];

  @ApiProperty({ description: '最大使用次数' })
  @IsNumber()
  @IsOptional()
  @Expose()
  maxUse: number;

  @ApiProperty({ description: '有效期' })
  @IsDateString()
  @IsOptional()
  @Expose()
  expire: Date;
}
