import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IntegralName, UsersName } from 'src/modules/users/schemas/ref-names';
import { Integral } from 'src/modules/users/schemas/integral';
import { User } from 'src/modules/users/schemas/user';
import { Response } from 'src/utils/response';

@Injectable()
export class AiBalanceService {
  constructor(
    @InjectModel(UsersName)
    private usersModel: Model<User>,
    @InjectModel(IntegralName)
    private integralModel: Model<Integral>,
  ) {}

  async page(query: any = {}) {
    const { page = 1, pageSize = 10, q, search } = query;
    const keyword = q || search;
    const filter: any = { isDelete: { $in: [false, null] } };
    if (keyword) {
      filter.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { nickname: { $regex: keyword, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.usersModel
        .find(filter)
        .select('+integral +status +enable +createdAt')
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .sort({ createdAt: -1 })
        .exec(),
      this.usersModel.countDocuments(filter).exec(),
    ]);

    return Response.page(data, { page, pageSize, total });
  }

  async logs(userId: string, query: any = {}) {
    const { page = 1, pageSize = 10 } = query;
    const filter = { user: userId };
    const [data, total] = await Promise.all([
      this.integralModel
        .find(filter)
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .sort({ createdAt: -1 })
        .exec(),
      this.integralModel.countDocuments(filter).exec(),
    ]);
    return Response.page(data, { page, pageSize, total });
  }

  async adjust(userId: string, integral: number, reason?: string) {
    const user = await this.usersModel.findById(userId).select('+integral username email').exec();
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const before = Number(user.integral || 0);
    const after = Number((before + Number(integral || 0)).toFixed(8));
    await this.usersModel.updateOne({ _id: userId }, { $set: { integral: after } }).exec();
    await this.integralModel.create({
      user: userId,
      integral,
      reason: reason || 'AI 余额调整',
    });

    return {
      user: { _id: user._id, username: user.username, email: user.email },
      balanceBefore: before,
      balanceAfter: after,
      integral,
    };
  }

  async ensurePositiveBalance(userId?: string) {
    if (!userId) {
      throw new HttpException(
        { error: { message: 'API Key 未绑定所属用户', type: 'invalid_request_error' } },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const user = await this.usersModel.findById(userId).select('+integral username email').exec();
    if (!user) {
      throw new HttpException(
        { error: { message: 'API Key 所属用户不存在', type: 'invalid_request_error' } },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (Number(user.integral || 0) <= 0) {
      throw new HttpException(
        { error: { message: '余额不足', type: 'insufficient_quota' } },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return user;
  }

  async charge(userId: string | undefined, amount: number, reason: string) {
    if (!userId || amount <= 0) {
      return {
        billingStatus: 'not_charged',
        chargedIntegral: 0,
        balanceBefore: undefined,
        balanceAfter: undefined,
      };
    }

    const user = await this.usersModel.findById(userId).select('+integral username email').exec();
    if (!user) {
      return {
        billingStatus: 'failed',
        chargedIntegral: 0,
        balanceBefore: undefined,
        balanceAfter: undefined,
      };
    }

    const before = Number(user.integral || 0);
    const after = Number((before - amount).toFixed(8));
    await this.usersModel.updateOne({ _id: userId }, { $set: { integral: after } }).exec();
    await this.integralModel.create({
      user: userId,
      integral: -amount,
      reason,
    });

    return {
      billingStatus: 'charged',
      chargedIntegral: amount,
      balanceBefore: before,
      balanceAfter: after,
    };
  }
}
