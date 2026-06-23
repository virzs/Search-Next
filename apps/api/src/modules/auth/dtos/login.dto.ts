import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @IsNotEmpty({ message: '邮箱不能为空' })
  @Expose()
  email: string;

  @ApiProperty({ description: '密码' })
  @MaxLength(20, { message: '密码长度不能大于20位' })
  @MinLength(6, { message: '密码长度不能小于6位' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Expose()
  password: string;
}
