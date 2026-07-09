import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsEmail,
  IsDefined,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class SetupMongoDto {
  @ApiProperty({ example: "127.0.0.1" })
  @IsString()
  @IsNotEmpty()
  @Expose()
  host: string;

  @ApiProperty({ example: 27017 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  @Expose()
  port: number;

  @ApiProperty({ example: "search_next" })
  @IsString()
  @IsNotEmpty()
  @Expose()
  database: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  username?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  password?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  authSource?: string;
}

export class SetupRedisDto {
  @ApiProperty({ example: "127.0.0.1" })
  @IsString()
  @IsNotEmpty()
  @Expose()
  host: string;

  @ApiProperty({ example: 6379 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  @Expose()
  port: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  password?: string;

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(15)
  @Expose()
  db: number;

  @ApiProperty({ example: 60, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @Expose()
  ttl?: number;
}

export class SetupR2Dto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  accessKey?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  secretKey?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  bucket?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  accountId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  customDomain?: string;
}

export class SetupStorageDto {
  @ApiProperty({ enum: ["local", "r2"], example: "local" })
  @IsString()
  @IsIn(["local", "r2"])
  @Expose()
  service: "local" | "r2";

  @ApiProperty({ example: "./assets/uploads", required: false })
  @IsString()
  @IsOptional()
  @Expose()
  localPath?: string;

  @ValidateNested()
  @Type(() => SetupR2Dto)
  @IsOptional()
  @Expose()
  r2?: SetupR2Dto;
}

export class SetupAdminDto {
  @ApiProperty({ example: "admin" })
  @IsString()
  @IsNotEmpty()
  @Expose()
  username: string;

  @ApiProperty({ example: "admin@example.com" })
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Expose()
  password: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Expose()
  confirmPassword: string;
}

export class SetupCheckDto {
  @IsDefined({ message: "请填写 MongoDB 配置" })
  @ValidateNested()
  @Type(() => SetupMongoDto)
  @Expose()
  mongo: SetupMongoDto;

  @IsDefined({ message: "请填写 Redis 配置" })
  @ValidateNested()
  @Type(() => SetupRedisDto)
  @Expose()
  redis: SetupRedisDto;
}

export class SetupEnvironmentCompleteDto extends SetupCheckDto {
  @IsDefined({ message: "请选择存储方式" })
  @ValidateNested()
  @Type(() => SetupStorageDto)
  @Expose()
  storage: SetupStorageDto;
}

export class SetupAdminCompleteDto {
  @IsDefined({ message: "请填写管理员信息" })
  @ValidateNested()
  @Type(() => SetupAdminDto)
  @Expose()
  admin: SetupAdminDto;
}

export class SetupCompleteDto extends SetupEnvironmentCompleteDto {
  @IsDefined({ message: "请填写管理员信息" })
  @ValidateNested()
  @Type(() => SetupAdminDto)
  @Expose()
  admin: SetupAdminDto;
}
