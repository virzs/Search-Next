import { Model } from 'mongoose';
import { User } from './schemas/user';

const DELETED_IDENTITY_MARKER = '__deleted__';

const markValueDeleted = (value: string | undefined, id: string) => {
  if (!value || value.includes(DELETED_IDENTITY_MARKER)) {
    return value;
  }

  return `${value}${DELETED_IDENTITY_MARKER}${id}`;
};

export async function releaseDeletedUserIdentity(
  usersModel: Model<User>,
  identity: { email?: string; username?: string },
) {
  const fields: Array<'email' | 'username'> = ['email', 'username'];

  for (const field of fields) {
    const value = identity[field];
    if (!value) {
      continue;
    }

    const deletedUser = await usersModel
      .findOne({ [field]: value, isDelete: true })
      .select('+email +username +isDelete')
      .exec();

    if (!deletedUser) {
      continue;
    }

    const id = deletedUser._id.toString();
    await usersModel
      .updateOne(
        { _id: deletedUser._id },
        {
          $set: {
            [field]: markValueDeleted(value, id),
          },
        },
      )
      .exec();
  }
}

export async function markDeletedUser(usersModel: Model<User>, id: string) {
  const user = await usersModel
    .findById(id)
    .select('+email +username +isDelete')
    .exec();

  if (!user) {
    return null;
  }

  return usersModel
    .findByIdAndUpdate(
      id,
      {
        $set: {
          isDelete: true,
          email: markValueDeleted(user.email, id),
          username: markValueDeleted(user.username, id),
        },
        $inc: { sessionVersion: 1 },
      },
      { new: true },
    )
    .exec();
}
