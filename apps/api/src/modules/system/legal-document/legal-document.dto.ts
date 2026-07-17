import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PageDto } from 'src/public/dto/page';
import {
  LEGAL_DOCUMENT_TYPES,
  LegalDocumentLocale,
  LegalDocumentType,
} from './legal-document.schema';

export class LocalizedLegalTextDto {
  @ApiProperty({ description: '中文内容' })
  @IsString()
  @Expose()
  'zh-CN': string;

  @ApiProperty({ description: '英文内容', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  'en-US'?: string;
}

export class SaveLegalDocumentDraftDto {
  @ApiProperty({ type: LocalizedLegalTextDto })
  @ValidateNested()
  @Type(() => LocalizedLegalTextDto)
  @Expose()
  title: LocalizedLegalTextDto;

  @ApiProperty({ type: LocalizedLegalTextDto })
  @ValidateNested()
  @Type(() => LocalizedLegalTextDto)
  @Expose()
  content: LocalizedLegalTextDto;

  @ApiProperty({ description: '变更摘要', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  changeSummary?: string;
}

export class PublishLegalDocumentDto {
  @ApiProperty({ description: '是否要求现有用户重新确认', default: true })
  @IsBoolean()
  @Expose()
  requiresReconfirmation: boolean;
}

export class LegalDocumentHistoryQueryDto extends PageDto {}

export class LegalConfirmationItemDto {
  @ApiProperty({ enum: LEGAL_DOCUMENT_TYPES })
  @IsIn(LEGAL_DOCUMENT_TYPES)
  @Expose()
  documentType: LegalDocumentType;

  @ApiProperty({ description: '已发布文档版本 ID' })
  @IsMongoId()
  @Expose()
  revisionId: string;
}

export class LegalConfirmationsDto {
  @ApiProperty({ type: [LegalConfirmationItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LegalConfirmationItemDto)
  @Expose()
  legalConfirmations: LegalConfirmationItemDto[];

  @ApiProperty({ enum: ['zh-CN', 'en-US'], required: false })
  @IsIn(['zh-CN', 'en-US'])
  @IsOptional()
  @Expose()
  legalConfirmationLocale?: LegalDocumentLocale;
}
