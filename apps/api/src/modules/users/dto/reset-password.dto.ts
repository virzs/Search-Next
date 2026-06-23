import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class ResetPassowrdDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({ description: '验证码' })
  @IsNumber()
  @Expose()
  captcha: number;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @Expose()
  password: string;
}
