import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UsersName } from 'src/modules/users/schemas/ref-names';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

export const LegalDocumentSchemaName = 'LegalDocument';
export const LEGAL_DOCUMENT_TYPES = ['terms', 'privacy'] as const;
export const LEGAL_DOCUMENT_STATUSES = ['draft', 'published'] as const;

export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];
export type LegalDocumentStatus = (typeof LEGAL_DOCUMENT_STATUSES)[number];
export type LegalDocumentLocale = 'zh-CN' | 'en-US';
export type LocalizedLegalText = Partial<Record<LegalDocumentLocale, string>>;

const LocalizedTextSchema = {
  'zh-CN': { type: String, default: '' },
  'en-US': { type: String, default: '' },
};

@Schema({ timestamps: true })
export class LegalDocument extends BaseSchema {
  @Prop({ type: String, enum: LEGAL_DOCUMENT_TYPES, required: true })
  type: LegalDocumentType;

  @Prop({ type: String, enum: LEGAL_DOCUMENT_STATUSES, required: true })
  status: LegalDocumentStatus;

  @Prop({ type: LocalizedTextSchema, required: true })
  title: LocalizedLegalText;

  @Prop({ type: LocalizedTextSchema, required: true })
  content: LocalizedLegalText;

  @Prop({ type: String, default: '' })
  changeSummary?: string;

  @Prop({ type: Number, default: 0 })
  consentVersion: number;

  @Prop({ type: Boolean, default: false })
  requiresReconfirmation: boolean;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UsersName })
  publishedBy?: string;
}

export const LegalDocumentSchema = SchemaFactory.createForClass(LegalDocument);

baseSchemaMiddleware(LegalDocumentSchema);

LegalDocumentSchema.index(
  { type: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'draft', isDelete: false },
  },
);
LegalDocumentSchema.index({ type: 1, status: 1, publishedAt: -1 });
