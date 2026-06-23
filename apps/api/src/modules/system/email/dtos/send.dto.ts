import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @Expose()
  email: string;
}
