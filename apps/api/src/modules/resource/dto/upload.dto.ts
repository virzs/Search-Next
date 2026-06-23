import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class UploadDto {
  @ApiProperty({ description: '文件名' })
  @IsString()
  @Expose()
  filename: string;

  @ApiProperty({ description: '文件' })
  @Expose()
  file: any;
}

export class GetVisitUrlsDto {
  @ApiProperty({ description: '文件id' })
  @IsString({ each: true })
  @Expose()
  ids: string[];
}

export class CreateDirectUploadDto {
  @ApiProperty({ description: '目录' })
  @IsString()
  @Expose()
  dir: string;

  @ApiProperty({ description: '文件名' })
  @IsString()
  @Expose()
  filename: string;

  @ApiProperty({ description: '资源类型' })
  @IsString()
  @Expose()
  mimetype: string;

  @ApiProperty({ description: '资源大小' })
  @IsNumber()
  @Min(0)
  @Expose()
  size: number;
}

export class CompleteDirectUploadDto {
  @ApiProperty({ description: '上传凭证' })
  @IsString()
  @Expose()
  uploadToken: string;
}
