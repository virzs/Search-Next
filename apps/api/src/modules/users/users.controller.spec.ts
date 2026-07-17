import { UsersController } from './users.controller';

describe('UsersController account self-service', () => {
  const usersService = {
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    deleteAccount: jest.fn(),
  } as any;
  const controller = new UsersController(usersService);

  beforeEach(() => jest.clearAllMocks());

  it('uses the authenticated user id when updating a profile', async () => {
    usersService.updateProfile.mockResolvedValue({ username: 'new-name' });

    await controller.updateProfile('user-1', { username: 'new-name' });

    expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', {
      username: 'new-name',
    });
  });

  it('uses the authenticated user id when changing a password', async () => {
    const body = { currentPassword: 'Current1', newPassword: 'NewPass2' };

    await controller.changePassword('user-1', body);

    expect(usersService.changePassword).toHaveBeenCalledWith('user-1', body);
  });

  it('uses the authenticated user id when deleting an account', async () => {
    const body = { currentPassword: 'Current1', confirmation: 'username' };

    await controller.deleteAccount('user-1', body);

    expect(usersService.deleteAccount).toHaveBeenCalledWith('user-1', body);
  });
});
