import { HttpException } from '@nestjs/common';
import * as deletedUserIdentity from '../users/deleted-user-identity';
import { AuthService } from './auth.service';

describe('AuthService legal confirmations', () => {
  const usersModel = {} as any;
  const refreshTokenService = {
    createRefreshToken: jest.fn().mockReturnValue('refresh-token'),
    getTTL: jest.fn().mockReturnValue(60_000),
  } as any;
  const jwtService = {
    sign: jest.fn().mockReturnValue('access-token'),
  } as any;
  const invitationCodeService = {} as any;
  const projectService = {
    detail: jest.fn().mockResolvedValue({
      register: { allowRegister: true },
      turnstile: { enabled: false },
    }),
  } as any;
  const emailService = {} as any;
  const messageService = {
    sendMessageToUser: jest.fn().mockResolvedValue(undefined),
  } as any;
  const legalDocumentService = {
    validateCurrentConfirmations: jest.fn(),
    confirmDocumentsForUser: jest.fn(),
    buildConfirmationRecords: jest.fn(),
  } as any;
  const cacheManager = {
    get: jest.fn().mockResolvedValue({}),
    set: jest.fn(),
  } as any;

  const createService = () =>
    new AuthService(
      usersModel,
      refreshTokenService,
      jwtService,
      invitationCodeService,
      projectService,
      emailService,
      messageService,
      legalDocumentService,
      cacheManager,
    );

  beforeEach(() => jest.clearAllMocks());

  it('validates legal revisions before Turnstile and password checks', async () => {
    const error = new HttpException(
      { code: 'LEGAL_CONFIRMATION_REQUIRED' },
      428,
    );
    legalDocumentService.validateCurrentConfirmations.mockRejectedValue(error);
    const service = createService();
    const validateUser = jest.spyOn(service, 'validateUser');

    await expect(
      service.login(
        { email: 'user@example.com', password: 'secret1' },
        { 'user-agent': 'jest' },
      ),
    ).rejects.toBe(error);

    expect(projectService.detail).not.toHaveBeenCalled();
    expect(validateUser).not.toHaveBeenCalled();
  });

  it('validates legal revisions before registration creates a user', async () => {
    const error = new HttpException(
      { code: 'LEGAL_CONFIRMATION_REQUIRED' },
      428,
    );
    legalDocumentService.validateCurrentConfirmations.mockRejectedValue(error);
    const service = createService();

    await expect(
      service.register(
        {
          username: 'user',
          email: 'user@example.com',
          password: 'secret1',
          invitationCode: '',
        },
        {},
      ),
    ).rejects.toBe(error);

    expect(projectService.detail).not.toHaveBeenCalled();
  });

  it('records the current revisions before issuing web tokens', async () => {
    const documents = [
      {
        _id: '507f1f77bcf86cd799439011',
        type: 'privacy',
        consentVersion: 1,
      },
    ];
    legalDocumentService.validateCurrentConfirmations.mockResolvedValue(
      documents,
    );
    legalDocumentService.confirmDocumentsForUser.mockResolvedValue([]);
    const service = createService();
    jest.spyOn(service, 'validateUser').mockResolvedValue({
      _id: 'user-1',
      username: 'user',
      email: 'user@example.com',
      enable: true,
      isDelete: false,
    });

    const result = await service.login(
      {
        email: 'user@example.com',
        password: 'secret1',
        legalConfirmations: [
          {
            documentType: 'privacy',
            revisionId: '507f1f77bcf86cd799439011',
          },
        ],
        legalConfirmationLocale: 'zh-CN',
      },
      { 'user-agent': 'jest' },
    );

    expect(legalDocumentService.confirmDocumentsForUser).toHaveBeenCalledWith(
      'user-1',
      documents,
      'zh-CN',
      'login',
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ client: 'web' }),
    );
    expect(result).toMatchObject({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
  });

  it('returns a session directly after registration without a second login', async () => {
    const documents = [
      {
        _id: '507f1f77bcf86cd799439011',
        type: 'privacy',
        consentVersion: 1,
      },
    ];
    const confirmationRecords = [
      {
        documentType: 'privacy',
        revisionId: '507f1f77bcf86cd799439011',
        consentVersion: 1,
      },
    ];
    legalDocumentService.validateCurrentConfirmations.mockResolvedValue(
      documents,
    );
    legalDocumentService.buildConfirmationRecords.mockReturnValue(
      confirmationRecords,
    );
    jest
      .spyOn(deletedUserIdentity, 'releaseDeletedUserIdentity')
      .mockResolvedValue(undefined);

    usersModel.findOne = jest.fn().mockResolvedValue(null);
    usersModel.create = jest.fn().mockImplementation(async (data) => ({
      ...data,
      _id: { toString: () => 'user-1' },
      toObject: () => ({
        ...data,
        _id: 'user-1',
        username: 'new-user',
        email: 'new-user@example.com',
      }),
    }));

    const service = createService();
    const login = jest.spyOn(service, 'login');
    const result = await service.register(
      {
        username: 'new-user',
        email: 'new-user@example.com',
        password: 'secret1',
        invitationCode: '',
        legalConfirmations: [
          {
            documentType: 'privacy',
            revisionId: '507f1f77bcf86cd799439011',
          },
        ],
        legalConfirmationLocale: 'zh-CN',
      },
      { 'user-agent': 'jest' },
    );

    expect(login).not.toHaveBeenCalled();
    expect(projectService.detail).toHaveBeenCalledTimes(1);
    expect(usersModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ legalConfirmations: confirmationRecords }),
    );
    expect(result).toMatchObject({
      message: '注册成功',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
  });
});
