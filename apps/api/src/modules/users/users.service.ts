import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { PageDto } from 'src/public/dto/page';
import { Response } from 'src/utils/response';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPassowrdDto } from './dto/reset-password.dto';
import { UsersName } from './schemas/ref-names';
import { User } from './schemas/user';
import {
  markDeletedUser,
  releaseDeletedUserIdentity,
} from './deleted-user-identity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UsersName) private readonly usersModel: Model<User>,
  ) {}

  async getNormalUser(query: PageDto) {
    const { page = 1, pageSize = 10 } = query;

    const users = await this.usersModel
      .find({})
      .select('+type +status +enable +createdAt')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('roles')
      .exec();

    const total = await this.usersModel.countDocuments({
      isDelete: { $in: [false, null] },
    });

    return Response.page(users, { page, pageSize, total });
  }

  async create(body: CreateUserDto) {
    await releaseDeletedUserIdentity(this.usersModel, {
      email: body.email,
      username: body.username,
    });

    const existEmail = await this.usersModel.findOne({
      email: body.email,
      isDelete: { $in: [false, null] },
    });
    if (existEmail) {
      throw new BadRequestException('邮箱已存在');
    }

    const existUsername = await this.usersModel.findOne({
      username: body.username,
      isDelete: { $in: [false, null] },
    });
    if (existUsername) {
      throw new BadRequestException('用户名已存在');
    }

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(body.password, salt);

    const result = await this.usersModel.create({
      ...body,
      password,
      salt,
      status: body.status ?? 1,
      type: 1,
    });
    return result;
  }

  async detail(id: string) {
    const result = await this.usersModel
      .findOne({ _id: id, isDelete: { $in: [false, null] } })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      });
    return result;
  }

  async currentUser(user): Promise<any> {
    const result = await this.usersModel
      .findOne({ _id: user._id, isDelete: { $in: [false, null] } })
      .select('+roles +status +enable +integral +createdAt')
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      })
      .lean();

    if (!result) {
      throw new BadRequestException('用户不存在');
    }

    const isSuperAdmin = result.roles?.some((role) => role.isSuperAdmin);

    const permissions = isSuperAdmin
      ? []
      : (result.roles ?? [])
          .map((role) => role.permissions ?? [])
          .flat()
          .filter((item) => item && !item.isStale)
          .filter((item, index, self) => {
            return (
              index ===
              self.findIndex((t) => t._id?.toString() === item._id?.toString())
            );
          });

    return {
      ...result,
      isSuperAdmin,
      permissions,
    };
  }

  async update(id: string, body: UpdateUserDto) {
    const result = await this.usersModel.findByIdAndUpdate(
      id,
      {
        ...body,
        type: undefined,
        password: undefined,
        salt: undefined,
      },
      { new: true },
    );
    return result;
  }

  async delete(id: string) {
    return markDeletedUser(this.usersModel, id);
  }

  async resetPassword(body: ResetPassowrdDto) {
    const { email, captcha, password } = body;

    const user = await this.usersModel.findOne({
      email,
      isDelete: { $in: [false, null] },
    });

    if (!user) {
      throw new BadRequestException('邮箱不存在');
    }
  }

  async getPermissions(user) {
    const { _id } = user;

    const result = await this.usersModel
      .findById(_id)
      .select('+roles')
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      })
      .exec();

    if (result.roles?.some((role) => role.isSuperAdmin)) {
      return true;
    }

    const permissions = (result.roles ?? [])
      .map((i) => i.permissions ?? [])
      .flat()
      .filter((item) => item && !item.isStale)
      .filter((item, index, self) => {
        return (
          index ===
          self.findIndex((t) => t._id?.toString() === item._id?.toString())
        );
      });

    return permissions;
  }

  async findByEmail(email: string) {
    const result = await this.usersModel.findOne({
      email,
      isDelete: { $in: [false, null] },
    });
    return result;
  }

  // 启用或禁用账号 enable
  async changeEnable(id: string) {
    const user = await this.usersModel.findById(id).select('+enable');

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const result = await this.usersModel
      .findByIdAndUpdate(id, {
        enable: !user.enable,
      })
      .select('+enable');

    return result;
  }

  // 搜索用户
  async searchUsers(keyWords: string) {
    if (!keyWords) {
      return [];
    }

    const regex = new RegExp(keyWords, 'i');
    const users = await this.usersModel
      .find({
        $or: [{ username: regex }, { email: regex }, { nickname: regex }],
        isDelete: false,
      })
      .select('+type +status +enable')
      .populate('roles')
      .exec();

    return users;
  }

  // 统计
  async statistics() {
    // 总用户数
    const total = await this.usersModel.countDocuments({ isDelete: false });
    const active = await this.usersModel.countDocuments({
      status: 1,
      isDelete: false,
    });
    // 未验证邮箱的用户数
    const unverified = await this.usersModel.countDocuments({
      status: 0,
      isDelete: false,
    });
    // 已禁用的用户数
    const disabled = await this.usersModel.countDocuments({
      status: 2,
      isDelete: false,
    });
    // 今天注册成功的用户数
    const today = await this.usersModel.countDocuments({
      createdAt: {
        $lt: new Date(),
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
      status: 1,
      isDelete: false,
    });
    // 昨日注册成功的用户数
    const yesterday = await this.usersModel.countDocuments({
      createdAt: {
        $lt: new Date(new Date().setHours(0, 0, 0, 0)),
        $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
      status: 1,
      isDelete: false,
    });
    // 过去7天注册成功的用户数
    const today1 = new Date();

    const last7Days = await Promise.all(
      Array.from({ length: 7 }).map(async (_, index) => {
        const date = new Date(
          today1.getFullYear(),
          today1.getMonth(),
          today1.getDate() - index,
        );
        const count = await this.usersModel.countDocuments({
          isDelete: false,
          status: 1,
          createdAt: {
            $gte: date,
            $lt: new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() + 1,
            ),
          },
        });

        return {
          date,
          count,
        };
      }),
    );

    const sortedLast7Days = (await Promise.all(last7Days)).sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    });

    const last7DaysTotal = sortedLast7Days.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    const statusDistribution = [
      { name: '正常', value: active },
      { name: '未验证邮箱', value: unverified },
      { name: '禁用', value: disabled },
    ];

    const roleStats = await this.usersModel.aggregate([
      { $match: { isDelete: false } },
      { $unwind: { path: '$roles', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$roles',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'roles',
          localField: '_id',
          foreignField: '_id',
          as: 'role',
        },
      },
      { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          roleId: '$_id',
          name: { $ifNull: ['$role.name', '未分配角色'] },
          count: 1,
          isSuperAdmin: '$role.isSuperAdmin',
        },
      },
      { $sort: { count: -1 } },
    ]);

    const recentUsers = await this.usersModel
      .find({ isDelete: false })
      .select('+status +enable +createdAt')
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('roles')
      .exec();

    return {
      total,
      active,
      unverified,
      disabled,
      today,
      yesterday,
      last7Days: sortedLast7Days,
      last7DaysTotal,
      verifyRate: total ? Number(((active / total) * 100).toFixed(2)) : 0,
      disabledRate: total ? Number(((disabled / total) * 100).toFixed(2)) : 0,
      statusDistribution,
      roleDistribution: roleStats,
      recentUsers,
    };
  }
}
