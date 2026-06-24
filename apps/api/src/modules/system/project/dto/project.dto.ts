import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ResourceDto } from 'src/public/dto/resource.dto';

class SubObjectDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({ description: '副标题' })
  @IsString()
  @Expose()
  subTitle: string;

  @ApiProperty({ description: '背景图', type: ResourceDto })
  @ValidateNested()
  @IsOptional()
  @Expose()
  @Type(() => ResourceDto)
  @Transform(({ value }) => (value == null ? undefined : value))
  background?: ResourceDto;
}

class RegisterPageDto extends SubObjectDto {
  @ApiProperty({ description: '是否需要邮箱验证码注册' })
  @IsBoolean()
  @IsOptional()
  @Expose()
  forceEmailCaptcha: boolean;

  @ApiProperty({ description: '是否需要邀请码注册' })
  @IsBoolean()
  @IsOptional()
  @Expose()
  forceInvitationCode: boolean;

  @ApiProperty({ description: '是否允许注册' })
  @IsBoolean()
  @IsOptional()
  @Expose()
  allowRegister: boolean;

  @ApiProperty({ description: '禁止注册时的提示文字' })
  @IsString()
  @IsOptional()
  @Expose()
  registerDisabledTip: string;
}

class TurnstileConfigDto {
  @ApiProperty({ description: '是否启用 Cloudflare Turnstile 人机验证' })
  @IsBoolean()
  @IsOptional()
  @Expose()
  enabled?: boolean;

  @ApiProperty({ description: 'Cloudflare Turnstile site key' })
  @IsString()
  @IsOptional()
  @Expose()
  siteKey?: string;

  @ApiProperty({ description: 'Cloudflare Turnstile secret key' })
  @IsString()
  @IsOptional()
  @Expose()
  secretKey?: string;
}

export class ProjectDto {
  @ApiProperty({ description: '项目名称' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: '项目描述' })
  @IsString()
  @IsOptional()
  @Expose()
  description: string;

  @ApiProperty({ description: '登录页设置', type: SubObjectDto })
  @ValidateNested()
  @IsOptional()
  @Expose()
  @Type(() => SubObjectDto)
  @Transform(({ value }) => (value == null ? undefined : value))
  login?: SubObjectDto;

  @ApiProperty({ description: '注册页设置', type: SubObjectDto })
  @ValidateNested()
  @IsOptional()
  @Expose()
  @Type(() => RegisterPageDto)
  @Transform(({ value }) => (value == null ? undefined : value))
  register?: RegisterPageDto;

  @ApiProperty({ description: 'Cloudflare Turnstile 人机验证设置', type: TurnstileConfigDto })
  @ValidateNested()
  @IsOptional()
  @Expose()
  @Type(() => TurnstileConfigDto)
  @Transform(({ value }) => (value == null ? undefined : value))
  turnstile?: TurnstileConfigDto;
}
