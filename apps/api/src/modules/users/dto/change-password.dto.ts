import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  @Expose()
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @Expose()
  newPassword: string;

  @ApiProperty({ description: '验证码' })
  @IsNumber()
  @Expose()
  captcha: string;
}
