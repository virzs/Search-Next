import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsIn,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class VersionPlatformDto {
  @Expose()
  @IsString()
  @IsIn(["windows", "mac"], { message: "发布平台必须是 Windows 或 Mac" })
  platform: string;

  @Expose()
  @Transform(({ value }) => Number(value))
  @IsIn([1, 2], { message: "更新方式必须是强制更新或可选更新" })
  updateType: number;

  @Expose()
  @IsObject({ message: "安装包不能为空" })
  source: Record<string, unknown>;
}

export class VersionDto {
  @ApiProperty({ description: "版本号" })
  @IsString()
  @IsNotEmpty({ message: "版本号不能为空" })
  @Expose()
  version: string;

  @ApiProperty({ description: "发布平台" })
  @ArrayNotEmpty()
  @ArrayMaxSize(1, { message: "每次只能发布一个平台" })
  @Type(() => VersionPlatformDto)
  @ValidateNested({ each: true })
  @Expose()
  platforms: VersionPlatformDto[];

  @ApiProperty({ description: "更新内容" })
  @IsString()
  @IsNotEmpty({ message: "更新内容不能为空" })
  @Expose()
  content: string;

  @ApiProperty({ description: "发布时间" })
  @IsDateString()
  @IsOptional()
  @Expose()
  releaseTime: string;
}
