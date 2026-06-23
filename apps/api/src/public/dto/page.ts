import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsNumberString } from 'class-validator';

export class PageDto {
  @ApiProperty({ description: '页码', default: 1 })
  @IsNumberString(undefined, {
    message: '页码必须是数字',
  })
  @Expose()
  page: number;

  @ApiProperty({ description: '每页数量', default: 10 })
  @IsNumberString(undefined, {
    message: '每页数量必须是数字',
  })
  @Expose()
  pageSize: number;
}
