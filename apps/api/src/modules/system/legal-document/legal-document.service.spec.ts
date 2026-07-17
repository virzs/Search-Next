import { HttpException } from '@nestjs/common';
import { LegalDocumentService } from './legal-document.service';

const currentDocuments = [
  {
    _id: '507f1f77bcf86cd799439012',
    type: 'terms',
    title: { 'zh-CN': '服务条款' },
    content: { 'zh-CN': '内容' },
    consentVersion: 3,
    requiresReconfirmation: false,
    publishedAt: new Date('2026-07-17T00:00:00.000Z'),
  },
  {
    _id: '507f1f77bcf86cd799439011',
    type: 'privacy',
    title: { 'zh-CN': '隐私政策' },
    content: { 'zh-CN': '内容' },
    consentVersion: 2,
    requiresReconfirmation: true,
    publishedAt: new Date('2026-07-17T00:00:00.000Z'),
  },
];

describe('LegalDocumentService', () => {
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('returns a structured 428 before auth when confirmations are missing', async () => {
    const service = new LegalDocumentService({} as any, {} as any, cache as any);
    jest
      .spyOn(service, 'getCurrentPublishedDocuments')
      .mockResolvedValue(currentDocuments);

    try {
      await service.validateCurrentConfirmations(undefined);
      throw new Error('expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(428);
      expect((error as HttpException).getResponse()).toMatchObject({
        code: 'LEGAL_CONFIRMATION_REQUIRED',
        reason: 'missing',
      });
    }
  });

  it('accepts exactly the current published revisions', async () => {
    const service = new LegalDocumentService({} as any, {} as any, cache as any);
    jest
      .spyOn(service, 'getCurrentPublishedDocuments')
      .mockResolvedValue(currentDocuments);

    await expect(
      service.validateCurrentConfirmations([
        {
          documentType: 'terms',
          revisionId: '507f1f77bcf86cd799439012',
        },
        {
          documentType: 'privacy',
          revisionId: '507f1f77bcf86cd799439011',
        },
      ]),
    ).resolves.toBe(currentDocuments);
  });

  it('preserves first confirmation time and updates the latest audit fields', async () => {
    const user: any = {
      legalConfirmations: [],
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const usersModel = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(user),
        }),
      }),
    };
    const service = new LegalDocumentService(
      {} as any,
      usersModel as any,
      cache as any,
    );

    await service.confirmDocumentsForUser(
      'user-1',
      currentDocuments,
      'zh-CN',
      'login',
    );
    const firstTime = user.legalConfirmations[0].firstConfirmedAt;
    await service.confirmDocumentsForUser(
      'user-1',
      currentDocuments,
      'en-US',
      'login',
    );

    expect(user.legalConfirmations).toHaveLength(2);
    expect(user.legalConfirmations[0]).toMatchObject({
      firstConfirmedAt: firstTime,
      confirmationCount: 2,
      lastSource: 'login',
      locale: 'en-US',
    });
    expect(user.save).toHaveBeenCalledTimes(2);
  });

  it('keeps the consent version for a non-material publication', async () => {
    const draft = {
      _id: 'draft-1',
      title: { 'zh-CN': '隐私政策' },
      content: { 'zh-CN': '内容' },
    };
    const latest = {
      ...currentDocuments.find((document) => document.type === 'privacy'),
      consentVersion: 7,
    };
    const findOne = jest
      .fn()
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(draft) })
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(latest),
          }),
        }),
      });
    const findOneAndUpdate = jest
      .fn()
      .mockImplementation((_query, update) =>
        Promise.resolve({ _id: 'draft-1', ...update.$set }),
      );
    const service = new LegalDocumentService(
      { findOne, findOneAndUpdate } as any,
      {} as any,
      cache as any,
    );

    const result: any = await service.publish(
      'privacy',
      { requiresReconfirmation: false },
      'user-1',
    );

    expect(result.consentVersion).toBe(7);
    expect(result.requiresReconfirmation).toBe(false);
    expect(cache.del).toHaveBeenCalled();
  });
});
