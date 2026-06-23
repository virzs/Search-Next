import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class ResourceDto {
  @ApiProperty({ description: 'id' })
  @IsMongoId()
  @Expose()
  _id: string;

  @ApiProperty({ description: '文件名' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: '文件类型' })
  @IsString()
  @Expose()
  mimetype: string;

  @ApiProperty({ description: '文件大小' })
  @IsNumber()
  @Expose()
  size: number;
}
