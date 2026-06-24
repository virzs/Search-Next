import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PageDto } from '../../../../public/dto/page';

export class UserDataSyncDto {
  @ApiPropertyOptional({ description: '覆盖已有云备份版本ID' })
  @IsOptional()
  @IsMongoId()
  @Expose()
  backupId?: string;

  @ApiPropertyOptional({ description: '云备份版本名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Expose()
  name?: string;

  @ApiProperty({
    description: '用户同步数据快照。admin 接口不会返回该字段。',
    example: {
      version: 1,
      createdAt: '2026-06-24T00:00:00.000Z',
      items: {
        SEARCH_NEXT_DESKTOP_LIST: '[]',
      },
    },
  })
  @IsObject()
  @IsNotEmpty()
  @Expose()
  payload: Record<string, any>;
}

export class RenameUserDataSyncDto {
  @ApiProperty({ description: '云备份版本名称' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  name: string;
}

export class UserDataSyncAdminQueryDto extends PageDto {
  @ApiPropertyOptional({ description: '搜索用户名、邮箱或昵称' })
  @IsOptional()
  @IsString()
  @Expose()
  search?: string;
}

export class UserDataSyncAdminVersionsQueryDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsMongoId()
  @Expose()
  userId: string;
}
