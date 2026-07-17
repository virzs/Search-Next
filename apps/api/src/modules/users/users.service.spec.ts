import * as bcrypt from 'bcryptjs';
import DefaultDTOValidationPipe from 'src/public/pipe/dtoValid';
import * as deletedUserIdentity from './deleted-user-identity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

const createQuery = <T>(value: T) => {
  const query: any = {
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };
  query.select.mockReturnValue(query);
  query.lean.mockResolvedValue(value);
  query.exec.mockResolvedValue(value);
  return query;
};

describe('UsersService account self-service', () => {
  const usersModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  } as any;
  const cacheManager = {
    del: jest.fn().mockResolvedValue(undefined),
  } as any;
  const service = new UsersService(usersModel, cacheManager);

  beforeEach(() => {
    jest.clearAllMocks();
    usersModel.updateOne.mockResolvedValue({ acknowledged: true });
  });

  it('keeps only username in the profile DTO', async () => {
    const pipe = new DefaultDTOValidationPipe();

    await expect(
      pipe.transform(
        {
          username: '  新用户  ',
          email: 'changed@example.com',
          roles: ['admin'],
          status: 2,
        },
        { type: 'body', metatype: UpdateProfileDto, data: undefined },
      ),
    ).resolves.toEqual({ username: '新用户' });
  });

  it('rejects an invalid username in the profile DTO', async () => {
    const pipe = new DefaultDTOValidationPipe();

    await expect(
      pipe.transform(
        { username: 'invalid name' },
        { type: 'body', metatype: UpdateProfileDto, data: undefined },
      ),
    ).rejects.toThrow('用户名只能包含字母、数字、下划线和中文');
  });

  it('rejects a username already used by another active account', async () => {
    usersModel.findOne
      .mockReturnValueOnce(createQuery({ _id: 'user-1', username: 'old' }))
      .mockResolvedValueOnce({ _id: 'user-2', username: 'taken' });

    await expect(
      service.updateProfile('user-1', { username: 'taken' }),
    ).rejects.toThrow('用户名已存在');
    expect(usersModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('updates only the username and returns safe profile fields', async () => {
    usersModel.findOne
      .mockReturnValueOnce(createQuery({ _id: 'user-1', username: 'old' }))
      .mockResolvedValueOnce(null);
    usersModel.findOneAndUpdate.mockReturnValue(
      createQuery({
        _id: 'user-1',
        username: 'new_name',
        email: 'user@example.com',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        sessionVersion: 9,
        password: 'hidden',
      }),
    );

    const result = await service.updateProfile('user-1', {
      username: 'new_name',
    });

    expect(usersModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'user-1' }),
      { $set: { username: 'new_name' } },
      { new: true },
    );
    expect(result).toEqual({
      _id: 'user-1',
      username: 'new_name',
      email: 'user@example.com',
      avatar: undefined,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
  });

  it('rejects a wrong current password', async () => {
    const password = await bcrypt.hash('Current1', 4);
    usersModel.findOne.mockReturnValue(
      createQuery({ _id: 'user-1', password }),
    );

    await expect(
      service.changePassword('user-1', {
        currentPassword: 'Wrong1',
        newPassword: 'NewPass2',
      }),
    ).rejects.toThrow('当前密码错误');
    expect(usersModel.updateOne).not.toHaveBeenCalled();
    expect(cacheManager.del).not.toHaveBeenCalled();
  });

  it('changes the password, advances the session version, and clears refresh sessions', async () => {
    const password = await bcrypt.hash('Current1', 4);
    usersModel.findOne.mockReturnValue(
      createQuery({ _id: 'user-1', password }),
    );

    await expect(
      service.changePassword('user-1', {
        currentPassword: 'Current1',
        newPassword: 'NewPass2',
      }),
    ).resolves.toEqual({ success: true });

    expect(usersModel.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'user-1' }),
      expect.objectContaining({
        $set: expect.objectContaining({ password: expect.any(String) }),
        $inc: { sessionVersion: 1 },
      }),
    );
    expect(cacheManager.del).toHaveBeenCalledWith(
      'auth:refresh-token:user-1',
    );
  });

  it('requires the exact current username before deleting the account', async () => {
    const password = await bcrypt.hash('Current1', 4);
    usersModel.findOne.mockReturnValue(
      createQuery({ _id: 'user-1', username: 'expected', password }),
    );

    await expect(
      service.deleteAccount('user-1', {
        currentPassword: 'Current1',
        confirmation: 'other',
      }),
    ).rejects.toThrow('确认文本与当前用户名不一致');
    expect(cacheManager.del).not.toHaveBeenCalled();
  });

  it('soft deletes the account and clears refresh sessions', async () => {
    const password = await bcrypt.hash('Current1', 4);
    usersModel.findOne.mockReturnValue(
      createQuery({ _id: 'user-1', username: 'expected', password }),
    );
    const markDeleted = jest
      .spyOn(deletedUserIdentity, 'markDeletedUser')
      .mockResolvedValue({ _id: 'user-1' } as any);

    await expect(
      service.deleteAccount('user-1', {
        currentPassword: 'Current1',
        confirmation: 'expected',
      }),
    ).resolves.toEqual({ success: true });

    expect(markDeleted).toHaveBeenCalledWith(usersModel, 'user-1');
    expect(cacheManager.del).toHaveBeenCalledWith(
      'auth:refresh-token:user-1',
    );
  });

  it('accepts only active sessions with the current version', async () => {
    usersModel.findOne.mockReturnValue(
      createQuery({ enable: true, sessionVersion: 3 }),
    );
    await expect(service.validateSession('user-1', 3)).resolves.toBe(true);

    usersModel.findOne.mockReturnValue(
      createQuery({ enable: true, sessionVersion: 4 }),
    );
    await expect(service.validateSession('user-1', 3)).resolves.toBe(false);

    usersModel.findOne.mockReturnValue(createQuery(null));
    await expect(service.validateSession('user-1', 3)).resolves.toBe(false);
  });
});
