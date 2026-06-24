import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserDataService } from './user-data.service';
import { UsersName } from '../../users/schemas/ref-names';
import { UserLimitService } from '../desktop/user-limit/user-limit.service';

describe('UserDataService', () => {
  let service: UserDataService;
  let syncModel: any;
  let widgetModel: any;
  let userModel: any;
  let userLimitService: any;

  const chain = (value: any) => ({
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  });

  beforeEach(async () => {
    syncModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    widgetModel = {
      find: jest.fn(),
    };
    userModel = {
      find: jest.fn(),
    };
    userLimitService = {
      getUserLimitForRoles: jest.fn().mockResolvedValue({
        maxConfigs: 1,
        maxPages: 5,
        maxSyncBackups: 2,
        source: 'default',
      }),
      checkUserSyncBackupLimit: jest.fn().mockResolvedValue(2),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDataService,
        { provide: getModelToken('UserDataSync'), useValue: syncModel },
        { provide: getModelToken('Widget'), useValue: widgetModel },
        { provide: getModelToken(UsersName), useValue: userModel },
        { provide: UserLimitService, useValue: userLimitService },
      ],
    }).compile();

    service = module.get<UserDataService>(UserDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a sync backup version and calculates metadata server-side', async () => {
    const userId = new Types.ObjectId().toHexString();
    const widgetId = new Types.ObjectId().toHexString();
    const payload = {
      version: 1,
      createdAt: '2026-06-24T00:00:00.000Z',
      items: {
        SEARCH_NEXT_DESKTOP_LIST: JSON.stringify([
          {
            id: 'dock',
            children: [
              { type: `widget:${widgetId}` },
              { dataType: `widget:${widgetId}` },
              { type: 'widget:dev_local' },
            ],
          },
        ]),
        SEARCH_NEXT_PERSONALIZATION: '{}',
      },
    };

    widgetModel.find.mockReturnValue(
      chain([{ _id: widgetId, name: 'Clock', version: '1.0.0' }]),
    );
    syncModel.countDocuments.mockResolvedValue(0);
    syncModel.create.mockResolvedValue({
      toJSON: () => ({ _id: 'sync-id' }),
    });
    syncModel.find.mockReturnValue(
      chain([
        {
          _id: 'sync-id',
          name: 'backup',
          payload,
          byteSize: Buffer.byteLength(JSON.stringify(payload), 'utf8'),
          itemCount: 2,
          pluginSummary: [
            {
              widgetId,
              name: 'Clock',
              version: '1.0.0',
              count: 2,
            },
          ],
          lastSyncedAt: new Date('2026-06-24T00:00:00.000Z'),
        },
      ]),
    );

    const result = await service.saveSync(userId, payload, { name: 'backup' });

    expect(syncModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'backup',
        userId,
        payload,
        byteSize: Buffer.byteLength(JSON.stringify(payload), 'utf8'),
        itemCount: 2,
        pluginSummary: [
          {
            widgetId,
            name: 'Clock',
            version: '1.0.0',
            count: 2,
          },
        ],
        creator: userId,
      }),
    );
    expect(userLimitService.checkUserSyncBackupLimit).toHaveBeenCalledWith(
      [],
      0,
    );
    expect(result.payload).toEqual(payload);
    expect(result.backups[0].pluginSummary).toEqual([
      {
        widgetId,
        name: 'Clock',
        version: '1.0.0',
        count: 2,
      },
    ]);
  });

  it('replaces an existing backup version without creating a new one', async () => {
    const userId = new Types.ObjectId().toHexString();
    const backupId = new Types.ObjectId().toHexString();
    const payload = { version: 1, createdAt: 'now', items: {} };
    widgetModel.find.mockReturnValue(chain([]));
    syncModel.findOneAndUpdate.mockReturnValue(
      chain({
        _id: backupId,
        userId,
        payload,
      }),
    );
    syncModel.find.mockReturnValue(
      chain([
        {
          _id: backupId,
          name: 'replaced',
          payload,
          byteSize: 10,
          itemCount: 0,
          pluginSummary: [],
          lastSyncedAt: new Date('2026-06-24T00:00:00.000Z'),
        },
      ]),
    );

    await service.saveSync(userId, payload, { backupId, name: 'replaced' });

    expect(syncModel.create).not.toHaveBeenCalled();
    expect(userLimitService.checkUserSyncBackupLimit).not.toHaveBeenCalled();
    expect(syncModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: backupId, userId },
      expect.objectContaining({
        $set: expect.objectContaining({ name: 'replaced', payload }),
      }),
      { new: true },
    );
  });

  it('renames an existing backup version owned by the user', async () => {
    const userId = new Types.ObjectId().toHexString();
    const backupId = new Types.ObjectId().toHexString();
    const payload = { version: 1, createdAt: 'now', items: {} };

    syncModel.findOneAndUpdate.mockReturnValue(chain({ _id: backupId }));
    syncModel.find.mockReturnValue(
      chain([
        {
          _id: backupId,
          name: 'renamed',
          payload,
          byteSize: 10,
          itemCount: 0,
          pluginSummary: [],
          lastSyncedAt: new Date('2026-06-24T00:00:00.000Z'),
        },
      ]),
    );

    const result = await service.renameSyncBackup(
      userId,
      backupId,
      '  renamed  ',
    );

    expect(syncModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: backupId, userId },
      {
        $set: {
          name: 'renamed',
          updater: userId,
        },
      },
      { new: true },
    );
    expect(result.backups[0].name).toBe('renamed');
  });

  it('does not expose payload through the admin sync list', async () => {
    const userId = new Types.ObjectId().toHexString();
    syncModel.find.mockReturnValue(
      chain([
        {
          _id: 'sync-id',
          name: 'backup',
          userId: {
            _id: userId,
            username: 'demo',
            email: 'demo@example.com',
          },
          payload: { secret: true },
          byteSize: 256,
          itemCount: 3,
          pluginSummary: [],
          lastSyncedAt: new Date('2026-06-24T00:00:00.000Z'),
        },
      ]),
    );
    syncModel.countDocuments.mockResolvedValue(1);

    const result = await service.getAdminSyncList({ page: 1, pageSize: 10 });

    expect(result.total).toBe(1);
    expect(result.data[0]).not.toHaveProperty('payload');
    expect(result.data[0]).toMatchObject({
      hasSynced: true,
      byteSize: 256,
      totalByteSize: 256,
      itemCount: 3,
      versionCount: 1,
      maxSyncBackups: 2,
      overLimit: false,
      user: {
        _id: userId,
        username: 'demo',
        email: 'demo@example.com',
      },
    });
  });
});
