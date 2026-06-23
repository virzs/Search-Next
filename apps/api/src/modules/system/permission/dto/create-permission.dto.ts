import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  @IsNotEmpty({ message: '权限名称不能为空' })
  @Expose()
  name: string;

  @ApiProperty({ description: '权限描述' })
  @IsString()
  @IsOptional()
  @Expose()
  description: string;

  @ApiProperty({ description: '权限地址' })
  // @ValidateIf((o) => !!o.parent)
  @IsOptional()
  @IsString()
  @Expose()
  url: string;

  @ApiProperty({ description: '请求方法' })
  @ValidateIf((o) => !!o.parent && [2].includes(o.level))
  @IsIn(['GET', 'POST', 'PUT', 'DELETE'])
  @Expose()
  method: string;

  @ApiProperty({ description: '权限类型' })
  @ValidateIf((o) => !!o.parent && [2].includes(o.level))
  @IsIn([0, 1])
  @Expose()
  type: number;

  @ApiProperty({ description: '上级权限id' })
  @IsMongoId()
  @IsOptional()
  @Expose()
  parent: string;
}
