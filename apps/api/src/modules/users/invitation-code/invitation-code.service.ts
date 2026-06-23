import { Injectable } from '@nestjs/common';
import { InvitationCodeName } from '../schemas/ref-names';
import { InvitationCode } from '../schemas/invitation-code';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InvitationCodeDto } from './dto/invitation-code.dto';

const invitedUserFields = '_id username email nickname avatar createdAt';

const maskEmail = (email?: string) => {
  if (!email) {
    return email;
  }

  const [name, domain] = email.split('@');
  if (!domain) {
    return email;
  }

  const visibleStart = name.slice(0, 2);
  const visibleEnd = name.length > 3 ? name.slice(-1) : '';
  return `${visibleStart}${'*'.repeat(Math.max(name.length - visibleStart.length - visibleEnd.length, 3))}${visibleEnd}@${domain}`;
};

@Injectable()
export class InvitationCodeService {
  constructor(
    @InjectModel(InvitationCodeName)
    private readonly codeModel: Model<InvitationCode>,
  ) {}

  async codeList(id: string) {
    const result = await this.codeModel
      .find({ creator: id })
      .populate('roles')
      .populate('users', invitedUserFields)
      .exec();
    return result;
  }

  async invitedUsers(id: string) {
    const codes = await this.codeModel
      .find({ creator: id })
      .select('code status useCount maxUse expire users createdAt')
      .populate('users', invitedUserFields)
      .exec();

    return codes.flatMap((item) =>
      item.users.map((user) => {
        const userInfo = user.toJSON();
        return {
          ...userInfo,
          email: maskEmail(userInfo.email),
          invitationCode: {
            _id: item._id,
            code: item.code,
            status: item.status,
            useCount: item.useCount,
            maxUse: item.maxUse,
            expire: item.expire,
            createdAt: item.createdAt,
          },
        };
      }),
    );
  }

  async create(user: string, data: InvitationCodeDto) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const result = await this.codeModel.create({
      ...data,
      code,
      creator: user,
    });
    return result;
  }

  //   useCount++
  async updateUseCount(code: string) {
    let result = await this.codeModel
      .findOneAndUpdate({ code }, { $inc: { useCount: 1 } }, { new: true })
      .exec();

    if (result && result.useCount >= result.maxUse) {
      result = await this.codeModel
        .findOneAndUpdate({ code }, { $set: { status: 1 } }, { new: true })
        .exec();
    }

    return result;
  }

  //   change status
  async changeStatus(_id: string) {
    const result = await this.codeModel
      .findByIdAndUpdate(_id, {
        status: 2,
      })
      .exec();
    return result;
  }

  async delete(_id: string, user: string) {
    const result = await this.codeModel
      .findOneAndUpdate(
        { _id, creator: user },
        { isDelete: true, updater: user },
        { new: true },
      )
      .exec();
    return result;
  }

  async checkCode(code: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.codeModel
      .findOne({
        code,
        status: 0,
        $or: [{ expire: { $exists: false } }, { expire: { $gte: today } }],
        $expr: { $lt: ['$useCount', '$maxUse'] },
      })
      .exec();

    return result;
  }

  //   更新邀请码使用人users
  async updateUsers(code: string, user: string) {
    const result = await this.codeModel
      .findOneAndUpdate(
        {
          code,
        },
        {
          $push: {
            users: user,
          },
          $inc: {
            useCount: 1,
          },
        },
      )
      .exec();
    return result;
  }
}
