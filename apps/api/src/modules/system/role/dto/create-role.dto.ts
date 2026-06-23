import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  @Expose()
  name: string;

  @ApiProperty({ description: '角色描述' })
  @IsOptional()
  @IsString()
  @Expose()
  description: string;

  @ApiProperty({ description: '权限id列表' })
  @IsMongoId({ each: true })
  @Expose()
  permissions: string[];
}
