import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class JobStatusUpdateDto {
  @ApiProperty({ description: '任务ID' })
  @Expose()
  @IsString()
  jobId: string;

  @ApiProperty({
    description: '状态',
    enum: ['queued', 'running', 'completed', 'error'],
  })
  @Expose()
  @IsString()
  status: 'queued' | 'running' | 'completed' | 'error';

  @ApiProperty({ description: '进度（0-100）', required: false })
  @Expose()
  @IsOptional()
  @IsNumber()
  progress?: number;

  @ApiProperty({ description: '输出图片URL数组', required: false })
  @Expose()
  @IsOptional()
  @IsArray()
  outputUrls?: string[];

  @ApiProperty({ description: 'ComfyUI prompt_id', required: false })
  @Expose()
  @IsOptional()
  @IsString()
  promptId?: string;

  @ApiProperty({ description: '错误信息', required: false })
  @Expose()
  @IsOptional()
  @IsString()
  error?: string;
}

