import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { User, LegalConfirmation } from 'src/modules/users/schemas/user';
import { UsersName } from 'src/modules/users/schemas/ref-names';
import { Response } from 'src/utils/response';
import {
  LegalConfirmationItemDto,
  LegalDocumentHistoryQueryDto,
  PublishLegalDocumentDto,
  SaveLegalDocumentDraftDto,
} from './legal-document.dto';
import {
  LEGAL_DOCUMENT_TYPES,
  LegalDocument,
  LegalDocumentLocale,
  LegalDocumentSchemaName,
  LegalDocumentType,
} from './legal-document.schema';

export type LegalConfirmationSource = 'register' | 'login' | 'in_app';

const CURRENT_DOCUMENTS_CACHE_KEY = 'system:legal-documents:current';
const CURRENT_DOCUMENTS_CACHE_TTL = 60_000;

@Injectable()
export class LegalDocumentService {
  constructor(
    @InjectModel(LegalDocumentSchemaName)
    private readonly legalDocumentModel: Model<LegalDocument>,
    @InjectModel(UsersName)
    private readonly usersModel: Model<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private assertType(value: string): asserts value is LegalDocumentType {
    if (!LEGAL_DOCUMENT_TYPES.includes(value as LegalDocumentType)) {
      throw new BadRequestException('法律文档类型无效');
    }
  }

  private normalizeLocale(locale?: string): LegalDocumentLocale {
    return locale === 'en-US' ? 'en-US' : 'zh-CN';
  }

  private toPlain(document: any) {
    if (!document) return null;
    return typeof document.toObject === 'function'
      ? document.toObject()
      : document;
  }

  private toMetadata(document: any) {
    const value = this.toPlain(document);
    return {
      type: value.type as LegalDocumentType,
      revisionId: String(value._id),
      title: value.title ?? {},
      consentVersion: Number(value.consentVersion ?? 0),
      requiresReconfirmation: Boolean(value.requiresReconfirmation),
      changeSummary: value.changeSummary ?? '',
      publishedAt: value.publishedAt,
    };
  }

  private orderDocuments(documents: any[]) {
    return [...documents].sort(
      (a, b) =>
        LEGAL_DOCUMENT_TYPES.indexOf(a.type) -
        LEGAL_DOCUMENT_TYPES.indexOf(b.type),
    );
  }

  async getCurrentPublishedDocuments(): Promise<any[]> {
    const cached = await this.cacheManager.get<any[]>(
      CURRENT_DOCUMENTS_CACHE_KEY,
    );
    if (cached) return this.orderDocuments(cached);

    const documents = this.orderDocuments(
      (
        await Promise.all(
          LEGAL_DOCUMENT_TYPES.map((type) =>
            this.legalDocumentModel
              .findOne({ type, status: 'published' })
              .sort({ publishedAt: -1, createdAt: -1 })
              .lean()
              .exec(),
          ),
        )
      ).filter(Boolean),
    );

    await this.cacheManager.set(
      CURRENT_DOCUMENTS_CACHE_KEY,
      documents,
      CURRENT_DOCUMENTS_CACHE_TTL,
    );
    return documents;
  }

  async publicVersions() {
    const documents = await this.getCurrentPublishedDocuments();
    return documents.map((document) => this.toMetadata(document));
  }

  async publicCurrent(typeValue: string, localeValue?: string) {
    this.assertType(typeValue);
    const locale = this.normalizeLocale(localeValue);
    const documents = await this.getCurrentPublishedDocuments();
    const document = documents.find((item) => item.type === typeValue);
    if (!document) return null;

    const metadata = this.toMetadata(document);
    const resolvedLocale =
      locale === 'en-US' && document.content?.['en-US']?.trim()
        ? 'en-US'
        : 'zh-CN';

    return {
      ...metadata,
      requestedLocale: locale,
      resolvedLocale,
      title:
        document.title?.[resolvedLocale] ||
        document.title?.['zh-CN'] ||
        '',
      content:
        document.content?.[resolvedLocale] ||
        document.content?.['zh-CN'] ||
        '',
      availableLocales: (['zh-CN', 'en-US'] as LegalDocumentLocale[]).filter(
        (item) => Boolean(document.content?.[item]?.trim()),
      ),
    };
  }

  async getDraft(typeValue: string) {
    this.assertType(typeValue);
    const draft = await this.legalDocumentModel
      .findOne({ type: typeValue, status: 'draft' })
      .populate('creator', 'username')
      .populate('updater', 'username')
      .exec();
    const latest = await this.legalDocumentModel
      .findOne({ type: typeValue, status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean()
      .exec();

    if (draft) {
      return {
        ...this.toPlain(draft),
        currentPublished: latest ? this.toMetadata(latest) : null,
      };
    }

    return {
      _id: null,
      type: typeValue,
      status: 'draft',
      title: latest?.title ?? { 'zh-CN': '', 'en-US': '' },
      content: latest?.content ?? { 'zh-CN': '', 'en-US': '' },
      changeSummary: '',
      sourceRevisionId: latest?._id ? String(latest._id) : null,
      currentPublished: latest ? this.toMetadata(latest) : null,
    };
  }

  async saveDraft(
    typeValue: string,
    body: SaveLegalDocumentDraftDto,
    userId: string,
  ) {
    this.assertType(typeValue);
    return this.legalDocumentModel.findOneAndUpdate(
      { type: typeValue, status: 'draft' },
      {
        $set: {
          title: body.title,
          content: body.content,
          changeSummary: body.changeSummary ?? '',
          updater: userId,
        },
        $setOnInsert: {
          type: typeValue,
          status: 'draft',
          creator: userId,
          consentVersion: 0,
          requiresReconfirmation: false,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  async publish(
    typeValue: string,
    body: PublishLegalDocumentDto,
    userId: string,
  ) {
    this.assertType(typeValue);
    const draft = await this.legalDocumentModel
      .findOne({ type: typeValue, status: 'draft' })
      .exec();
    if (!draft) throw new BadRequestException('请先保存草稿');

    if (!draft.title?.['zh-CN']?.trim()) {
      throw new BadRequestException('中文标题不能为空');
    }
    if (!draft.content?.['zh-CN']?.trim()) {
      throw new BadRequestException('中文内容不能为空');
    }

    const latest = await this.legalDocumentModel
      .findOne({ type: typeValue, status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean()
      .exec();
    const requiresReconfirmation = latest
      ? Boolean(body.requiresReconfirmation)
      : true;
    const consentVersion = latest
      ? Number(latest.consentVersion ?? 0) +
        (requiresReconfirmation ? 1 : 0)
      : 1;
    const publishedAt = new Date();

    const published = await this.legalDocumentModel.findOneAndUpdate(
      { _id: draft._id, status: 'draft' },
      {
        $set: {
          status: 'published',
          consentVersion,
          requiresReconfirmation,
          publishedAt,
          publishedBy: userId,
          updater: userId,
        },
      },
      { new: true },
    );
    if (!published) {
      throw new ConflictException('草稿已被发布，请刷新后重试');
    }

    await this.cacheManager.del(CURRENT_DOCUMENTS_CACHE_KEY);
    return published;
  }

  async history(typeValue: string, query: LegalDocumentHistoryQueryDto) {
    this.assertType(typeValue);
    const { page = 1, pageSize = 10 } = query;
    const finder = { type: typeValue, status: 'published' };
    const [data, total] = await Promise.all([
      this.legalDocumentModel
        .find(finder)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .populate('publishedBy', 'username')
        .exec(),
      this.legalDocumentModel.countDocuments(finder),
    ]);
    return Response.page(data, { page, pageSize, total });
  }

  async revision(typeValue: string, revisionId: string) {
    this.assertType(typeValue);
    const document = await this.legalDocumentModel
      .findOne({
        _id: revisionId,
        type: typeValue,
        status: 'published',
      })
      .populate('publishedBy', 'username')
      .exec();
    if (!document) throw new NotFoundException('文档版本不存在');
    return document;
  }

  private throwConfirmationRequired(
    reason: 'missing' | 'stale',
    documents: any[],
  ): never {
    throw new HttpException(
      {
        statusCode: 428,
        code: 'LEGAL_CONFIRMATION_REQUIRED',
        reason,
        message: '请确认最新的服务条款和隐私政策',
        documents: documents.map((document) => this.toMetadata(document)),
      },
      428,
    );
  }

  async validateCurrentConfirmations(
    confirmations?: LegalConfirmationItemDto[],
  ) {
    const currentDocuments = await this.getCurrentPublishedDocuments();
    if (!currentDocuments.length) return [];

    const input = new Map(
      (confirmations ?? []).map((item) => [
        item.documentType,
        String(item.revisionId),
      ]),
    );
    if (input.size !== currentDocuments.length) {
      this.throwConfirmationRequired('missing', currentDocuments);
    }

    const stale = currentDocuments.some(
      (document) => input.get(document.type) !== String(document._id),
    );
    if (stale) this.throwConfirmationRequired('stale', currentDocuments);
    return currentDocuments;
  }

  buildConfirmationRecords(
    documents: any[],
    source: LegalConfirmationSource,
    localeValue?: string,
  ): LegalConfirmation[] {
    const confirmedAt = new Date();
    const locale = this.normalizeLocale(localeValue);
    return documents.map((document) => ({
      documentType: document.type,
      revisionId: String(document._id),
      consentVersion: Number(document.consentVersion ?? 0),
      firstConfirmedAt: confirmedAt,
      lastConfirmedAt: confirmedAt,
      confirmationCount: 1,
      firstSource: source,
      lastSource: source,
      locale,
    }));
  }

  async confirmForUser(
    userId: string,
    confirmations: LegalConfirmationItemDto[],
    localeValue: string | undefined,
    source: LegalConfirmationSource,
  ) {
    const currentDocuments = await this.getCurrentPublishedDocuments();
    const currentByType = new Map(
      currentDocuments.map((document) => [document.type, document]),
    );
    const documents = confirmations.map((confirmation) => {
      const current = currentByType.get(confirmation.documentType);
      if (!current || String(current._id) !== String(confirmation.revisionId)) {
        this.throwConfirmationRequired('stale', currentDocuments);
      }
      return current;
    });
    return this.confirmDocumentsForUser(userId, documents, localeValue, source);
  }

  async confirmDocumentsForUser(
    userId: string,
    documents: any[],
    localeValue: string | undefined,
    source: LegalConfirmationSource,
  ) {
    if (!documents.length) return [];

    const user = await this.usersModel
      .findById(userId)
      .select('+legalConfirmations')
      .exec();
    if (!user) throw new NotFoundException('用户不存在');

    const now = new Date();
    const locale = this.normalizeLocale(localeValue);
    user.legalConfirmations = user.legalConfirmations ?? [];

    for (const document of documents) {
      const revisionId = String(document._id);
      const existing = user.legalConfirmations.find(
        (item) => String(item.revisionId) === revisionId,
      );
      if (existing) {
        existing.lastConfirmedAt = now;
        existing.lastSource = source;
        existing.locale = locale;
        existing.confirmationCount = Number(existing.confirmationCount ?? 0) + 1;
      } else {
        user.legalConfirmations.push({
          documentType: document.type,
          revisionId,
          consentVersion: Number(document.consentVersion ?? 0),
          firstConfirmedAt: now,
          lastConfirmedAt: now,
          confirmationCount: 1,
          firstSource: source,
          lastSource: source,
          locale,
        } as LegalConfirmation);
      }
    }

    user.markModified('legalConfirmations');
    await user.save();
    return user.legalConfirmations;
  }

  async confirmationStatus(userId: string) {
    const documents = await this.getCurrentPublishedDocuments();
    const user = await this.usersModel
      .findById(userId)
      .select('+legalConfirmations')
      .lean()
      .exec();
    if (!user) throw new NotFoundException('用户不存在');

    const confirmations = user.legalConfirmations ?? [];
    return {
      documents: documents.map((document) => {
        const exact = confirmations.find(
          (item) => String(item.revisionId) === String(document._id),
        );
        const consentConfirmed = confirmations.some(
          (item) =>
            item.documentType === document.type &&
            Number(item.consentVersion) === Number(document.consentVersion),
        );
        return {
          ...this.toMetadata(document),
          confirmed: Boolean(exact),
          confirmationRequired: !consentConfirmed,
          confirmedAt: exact?.lastConfirmedAt ?? null,
        };
      }),
    };
  }

  async getPendingRequiredDocuments(userId: string) {
    const status = await this.confirmationStatus(userId);
    return status.documents.filter((document) => document.confirmationRequired);
  }

  async currentConsentSignature() {
    const documents = await this.getCurrentPublishedDocuments();
    return documents
      .map((document) => `${document.type}:${document.consentVersion}`)
      .join('|');
  }
}
