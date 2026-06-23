import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsMongoId } from 'class-validator';

export class SaveApiKeyDto {
  @ApiProperty({ description: '服务商ID' })
  @IsMongoId()
  @Expose()
  provider: string;

  @ApiProperty({ description: 'API密钥' })
  @IsString()
  @Expose()
  apiKey: string;
}
