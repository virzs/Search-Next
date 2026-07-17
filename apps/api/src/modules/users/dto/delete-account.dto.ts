import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ description: '当前密码' })
  @IsString()
  @IsNotEmpty({ message: '当前密码不能为空' })
  @MinLength(6, { message: '当前密码长度不能小于6位' })
  @MaxLength(20, { message: '当前密码长度不能大于20位' })
  @Expose()
  currentPassword: string;

  @ApiProperty({ description: '删除确认文本，必须与当前用户名一致' })
  @IsString()
  @IsNotEmpty({ message: '请输入用户名确认删除' })
  @MaxLength(20, { message: '确认用户名长度不能大于20位' })
  @Expose()
  confirmation: string;
}
