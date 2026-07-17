import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { LegalConfirmationItemDto } from 'src/modules/system/legal-document/legal-document.dto';

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

  @ApiProperty({ description: 'Cloudflare Turnstile 校验 token', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  turnstileToken?: string;

  @ApiProperty({
    description: '当前服务条款和隐私政策版本确认',
    type: [LegalConfirmationItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LegalConfirmationItemDto)
  @IsOptional()
  @Expose()
  legalConfirmations?: LegalConfirmationItemDto[];

  @ApiProperty({ enum: ['zh-CN', 'en-US'], required: false })
  @IsIn(['zh-CN', 'en-US'])
  @IsOptional()
  @Expose()
  legalConfirmationLocale?: 'zh-CN' | 'en-US';
}
