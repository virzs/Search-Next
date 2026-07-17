import { HttpException } from '@nestjs/common';
import { LegalConfirmationGuard } from './legal-confirmation.guard';

const createContext = (user: any) =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as any;

describe('LegalConfirmationGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(false),
  };
  const legalDocumentService = {
    currentConsentSignature: jest.fn().mockResolvedValue('terms:1|privacy:2'),
    getPendingRequiredDocuments: jest.fn(),
  };
  const usersService = {
    isSuperAdministrator: jest.fn().mockResolvedValue(false),
  };
  const cache = {
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    reflector.getAllAndOverride.mockReturnValue(false);
    cache.get.mockResolvedValue(undefined);
    usersService.isSuperAdministrator.mockResolvedValue(false);
  });

  it('does not exempt a regular session created by the admin login endpoint', async () => {
    legalDocumentService.getPendingRequiredDocuments.mockResolvedValue([
      { type: 'privacy', revisionId: 'revision-2', consentVersion: 2 },
    ]);
    const guard = new LegalConfirmationGuard(
      reflector as any,
      legalDocumentService as any,
      usersService as any,
      cache as any,
    );

    await expect(
      guard.canActivate(createContext({ _id: 'admin-1', client: 'admin' })),
    ).rejects.toMatchObject({ status: 428 });
    expect(usersService.isSuperAdministrator).toHaveBeenCalledWith('admin-1');
  });

  it('exempts a super administrator with a legacy session token', async () => {
    usersService.isSuperAdministrator.mockResolvedValue(true);
    const guard = new LegalConfirmationGuard(
      reflector as any,
      legalDocumentService as any,
      usersService as any,
      cache as any,
    );

    await expect(
      guard.canActivate(createContext({ _id: 'admin-1' })),
    ).resolves.toBe(true);
    expect(usersService.isSuperAdministrator).toHaveBeenCalledWith(
      'admin-1',
    );
    expect(
      legalDocumentService.getPendingRequiredDocuments,
    ).not.toHaveBeenCalled();
  });

  it('returns 428 with pending versions for an unconfirmed web user', async () => {
    legalDocumentService.getPendingRequiredDocuments.mockResolvedValue([
      { type: 'privacy', revisionId: 'revision-2', consentVersion: 2 },
    ]);
    const guard = new LegalConfirmationGuard(
      reflector as any,
      legalDocumentService as any,
      usersService as any,
      cache as any,
    );

    try {
      await guard.canActivate(
        createContext({ _id: 'user-1', client: 'web' }),
      );
      throw new Error('expected guard to reject the request');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(428);
      expect((error as HttpException).getResponse()).toMatchObject({
        code: 'LEGAL_CONFIRMATION_REQUIRED',
      });
    }
  });
});
