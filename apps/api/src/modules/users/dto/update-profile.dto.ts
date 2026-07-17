import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Expose } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: '用户名' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: '用户名长度不能小于2位' })
  @MaxLength(20, { message: '用户名长度不能大于20位' })
  @Matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, {
    message: '用户名只能包含字母、数字、下划线和中文',
  })
  @Expose()
  username: string;
}
