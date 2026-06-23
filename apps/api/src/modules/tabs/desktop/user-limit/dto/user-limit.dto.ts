import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  Max,
  ValidateNested,
  IsMongoId,
} from 'class-validator';

// 角色配置DTO
export class RoleConfigDto {
  @ApiProperty({ description: '角色ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  @Expose()
  role: string;

  @ApiProperty({ description: '该角色的最大配置数量', example: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Expose()
  maxConfigs: number;

  @ApiProperty({ description: '该角色单个配置最大分页数量', example: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Expose()
  maxPages: number;
}

// 用户配置限制相关DTO
export class CreateUserConfigLimitDto {
  @ApiProperty({ description: '默认最大配置数量', example: 5 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Expose()
  defaultMaxConfigs: number;

  @ApiProperty({ description: '单个配置中桌面默认最大分页数量', example: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Expose()
  defaultMaxPages: number;

  @ApiPropertyOptional({
    description: '针对不同角色的配置限制',
    example: [
      { role: '507f1f77bcf86cd799439011', maxConfigs: 10, maxPages: 10 },
      { role: '507f1f77bcf86cd799439012', maxConfigs: 20, maxPages: 15 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleConfigDto)
  @Expose()
  roleConfigs?: RoleConfigDto[];

  @ApiPropertyOptional({
    description: '规则描述',
    example: '用户桌面配置数量限制规则',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Expose()
  description?: string;
}

export class UpdateUserConfigLimitDto extends CreateUserConfigLimitDto {}

// 查询DTO
export class UserConfigLimitQueryDto {
  @ApiPropertyOptional({ description: '关键词搜索', example: '限制' })
  @IsOptional()
  @IsString()
  @Expose()
  q?: string;
}
