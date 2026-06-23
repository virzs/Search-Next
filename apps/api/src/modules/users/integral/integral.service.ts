import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Integral } from '../schemas/integral';
import { InjectModel } from '@nestjs/mongoose';
import { IntegralName, UsersName } from '../schemas/ref-names';
import { PageDto } from 'src/public/dto/page';
import { Response } from 'src/utils/response';
import { User } from '../schemas/user';
import { IntegralDto } from './dto/integral.dto';

@Injectable()
export class IntegralService {
  constructor(
    @InjectModel(IntegralName)
    private readonly integralModel: Model<Integral>,
    @InjectModel(UsersName) private readonly usersModel: Model<User>,
  ) {}

  async page(query: PageDto, user: string) {
    const { page = 1, pageSize = 10 } = query;

    const users = await this.integralModel
      .find({ user })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('roles')
      .exec();

    const total = await this.integralModel.countDocuments({});

    return Response.page(users, { page, pageSize, total });
  }

  /** 创建积分记录 */
  async create(body: IntegralDto) {
    const { user } = body;

    const userDoc = await this.usersModel.findById(user).exec();
    if (!userDoc) {
      return new BadRequestException('用户不存在');
    }

    const integralDoc = await this.integralModel.create(body);

    return integralDoc;
  }

  /** 修改用户积分 */
  async updateIntegral(body: IntegralDto) {
    const { user, integral } = body;

    const userDoc = await this.usersModel.findById(user).exec();
    if (!userDoc) {
      return new BadRequestException('用户不存在');
    }

    const integralDoc = await this.create(body);

    await this.usersModel.findByIdAndUpdate(
      {
        _id: user,
      },
      {
        $inc: {
          integral,
        },
      },
    );

    return integralDoc;
  }

  /** 一键清空指定用户的积分 */
  async clearIntegral(user: string, reason: string) {
    await this.usersModel.findByIdAndUpdate(user, { integral: 0 }).exec();
    const result = await this.create({
      user,
      integral: 0,
      reason,
    });

    return result;
  }
}
