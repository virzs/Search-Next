import { RoleService } from './role.service';

describe('RoleService', () => {
  const roleModel = {
    findById: jest.fn(),
    create: jest.fn(),
  };
  const permissionModel = {
    find: jest.fn(),
  };
  let service: RoleService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoleService(roleModel as any, permissionModel as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns only active route permissions in the role form', async () => {
    roleModel.findById.mockReturnValue({
      lean: () => ({
        exec: async () => ({
          _id: 'role-id',
          name: '编辑员',
          permissions: ['group-id', 'route-id'],
        }),
      }),
    });
    permissionModel.find.mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: async () => [{ _id: { toString: () => 'route-id' } }],
        }),
      }),
    });

    await expect(service.detailPermissions('role-id')).resolves.toEqual({
      _id: 'role-id',
      name: '编辑员',
      permissions: ['route-id'],
    });
    expect(permissionModel.find).toHaveBeenCalledWith({
      _id: { $in: ['group-id', 'route-id'] },
      type: 1,
      isStale: { $ne: true },
    });
  });

  it('stores only active route permission ids', async () => {
    permissionModel.find.mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: async () => [{ _id: { toString: () => 'route-id' } }],
        }),
      }),
    });
    roleModel.create.mockResolvedValue({ _id: 'role-id' });

    await service.create(
      {
        name: '编辑员',
        description: '',
        permissions: ['group-id', 'route-id', 'stale-route-id'],
      },
      'user-id',
    );

    expect(roleModel.create).toHaveBeenCalledWith({
      name: '编辑员',
      description: '',
      permissions: ['route-id'],
      creator: 'user-id',
    });
  });
});
