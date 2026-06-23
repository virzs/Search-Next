import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class BaseUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @Expose()
  username: string;

  @ApiProperty({ description: '邮箱' })
  @IsString()
  @Expose()
  email: string;

  @ApiProperty({ description: '头像' })
  @IsOptional()
  @IsString()
  @Expose()
  avatar: string;

  @ApiProperty({ description: '账号状态' })
  @IsNumber()
  @IsOptional()
  @Expose()
  status: number;

  @ApiProperty({ description: '角色' })
  @IsArray()
  @IsOptional()
  @Expose()
  roles: string[];
}

export class CreateUserDto extends BaseUserDto {
  @ApiProperty({ description: '密码' })
  @IsString()
  @Expose()
  password: string;
}
