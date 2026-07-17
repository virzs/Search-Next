import mongoose, { Model } from 'mongoose';
import { User, UsersSchema } from './user';

describe('UsersSchema', () => {
  let userModel: Model<User>;

  beforeAll(() => {
    userModel = mongoose.model<User>('UsersSchemaTest', UsersSchema.clone());
  });

  afterAll(() => {
    mongoose.deleteModel('UsersSchemaTest');
  });

  it('allows the nickname to be omitted', () => {
    const user = new userModel({
      username: 'new-user',
      email: 'new-user@example.com',
      password: 'hashed-password',
    });

    expect(user.nickname).toBeUndefined();
    expect(user.validateSync()).toBeUndefined();
  });

  it('does not create a unique nickname index', () => {
    const nicknameIndex = UsersSchema.indexes().find(
      ([fields]) => fields.nickname === 1,
    );

    expect(nicknameIndex).toBeUndefined();
  });

  it('starts new accounts at session version zero', () => {
    const user = new userModel({
      username: 'session-user',
      email: 'session-user@example.com',
      password: 'hashed-password',
    });

    expect(user.sessionVersion).toBe(0);
  });
});
