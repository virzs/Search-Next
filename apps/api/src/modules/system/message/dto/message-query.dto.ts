import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PageDto } from 'src/public/dto/page';

export class MessageQueryDto extends PageDto {
  @ApiProperty({ description: '消息业务key', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  key?: string;
}
