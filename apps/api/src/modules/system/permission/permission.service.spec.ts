import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Permission } from 'src/schemas/permission';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getModelToken(Permission.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('builds the permission tree from a single query', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'system',
          name: '系统',
          parent: null,
          createdAt: new Date('2024-01-01'),
        },
        {
          _id: 'notice',
          name: '通知',
          parent: 'system',
          createdAt: new Date('2024-01-02'),
        },
        {
          _id: 'notice-page',
          name: '通知分页',
          parent: 'notice',
          createdAt: new Date('2024-01-03'),
        },
      ]),
    };
    const model = {
      find: jest.fn().mockReturnValue(query),
    };
    const treeService = new PermissionService(model as any);

    const tree = await treeService.treeInfo({} as any);

    expect(model.find).toHaveBeenCalledTimes(1);
    expect(query.lean).toHaveBeenCalledTimes(1);
    expect(tree).toEqual([
      expect.objectContaining({
        _id: 'system',
        level: 0,
        children: [
          expect.objectContaining({
            _id: 'notice',
            level: 1,
            children: [
              expect.objectContaining({
                _id: 'notice-page',
                level: 2,
                children: null,
              }),
            ],
          }),
        ],
      }),
    ]);
  });

  it('keeps ancestors when searching permission tree', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'system',
          name: '系统',
          parent: null,
          createdAt: new Date('2024-01-01'),
        },
        {
          _id: 'notice',
          name: '通知',
          parent: 'system',
          createdAt: new Date('2024-01-02'),
        },
        {
          _id: 'notice-page',
          name: '通知分页',
          parent: 'notice',
          createdAt: new Date('2024-01-03'),
        },
        {
          _id: 'resource',
          name: '资源',
          parent: null,
          createdAt: new Date('2024-01-04'),
        },
      ]),
    };
    const model = {
      find: jest.fn().mockReturnValue(query),
    };
    const treeService = new PermissionService(model as any);

    const tree = await treeService.treeInfo({ search: '通知分页' } as any);

    expect(tree).toHaveLength(1);
    expect(tree[0]).toEqual(
      expect.objectContaining({
        _id: 'system',
        children: [
          expect.objectContaining({
            _id: 'notice',
            children: [expect.objectContaining({ _id: 'notice-page' })],
          }),
        ],
      }),
    );
  });

  it('queries only active permissions for role configuration', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    const model = {
      find: jest.fn().mockReturnValue(query),
    };
    const treeService = new PermissionService(model as any);

    await treeService.treeInfo({ activeOnly: true } as any);

    expect(model.find).toHaveBeenCalledWith({ isStale: { $ne: true } });
  });
});
