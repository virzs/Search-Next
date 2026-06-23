import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'src/utils/response';
import {
  AdminDesktopConfig,
  AdminDesktopConfigName,
} from './schemas/admin-desktop-config.schema';
import {
  UserDesktopConfig,
  UserDesktopConfigName,
} from './schemas/user-desktop-config.schema';
import {
  CreateAdminDesktopConfigDto,
  UpdateAdminDesktopConfigDto,
  CreateUserDesktopConfigDto,
  UpdateUserDesktopConfigDto,
} from './dto/desktop-config.dto';
import { UserLimitService } from '../user-limit/user-limit.service';

@Injectable()
export class DesktopConfigService {
  constructor(
    @InjectModel(AdminDesktopConfigName)
    private readonly adminConfigModel: Model<AdminDesktopConfig>,
    @InjectModel(UserDesktopConfigName)
    private readonly userConfigModel: Model<UserDesktopConfig>,
    private readonly userLimitService: UserLimitService,
  ) {}

  // 计算配置中的分页数量，兼容 pages/tabs 两种字段；无分页则认为为 1
  private getPageCountFromConfig(config: any): number {
    if (!config) return 0;
    // 优先按 { list: [] } 中 type === 'page' 计数
    const list = (config as any).list;
    if (Array.isArray(list)) {
      return list.filter((item) => item && item.type === 'page').length;
    }
    // 兼容 pages/tabs 两种字段
    if (Array.isArray((config as any).pages)) {
      return (config as any).pages.length;
    }
    if (Array.isArray((config as any).tabs)) {
      return (config as any).tabs.length;
    }
    return 0;
  }

  // 管理员配置相关方法
  async getAdminConfigs(query: {
    page?: number;
    pageSize?: number;
    q?: string;
  }) {
    const { page = 1, pageSize = 10, q } = query;
    const finder: any = {};

    if (q) {
      finder.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const data = await this.adminConfigModel
      .find(finder)
      .select('-config')
      .populate('creator', 'username')
      .populate('updater', 'username')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    const total = await this.adminConfigModel.countDocuments(finder);

    return Response.page(data, { page, pageSize, total });
  }

  async getActiveAdminConfig() {
    return await this.adminConfigModel
      .findOne({ isActive: true })
      .select('config')
      .exec();
  }

  async createAdminConfig(dto: CreateAdminDesktopConfigDto, user?: string) {
    // 如果设置为激活状态，需要先将其他配置设为非激活
    if (dto.isActive) {
      await this.adminConfigModel.updateMany({}, { isActive: false });
    }

    const created = await this.adminConfigModel.create({
      ...dto,
      creator: user,
    });
    return created;
  }

  async updateAdminConfig(
    id: string,
    dto: UpdateAdminDesktopConfigDto,
    user?: string,
  ) {
    // 如果设置为激活状态，需要先将其他配置设为非激活
    if (dto.isActive) {
      await this.adminConfigModel.updateMany(
        { _id: { $ne: id } },
        { isActive: false },
      );
    }

    const updated = await this.adminConfigModel.findByIdAndUpdate(
      id,
      { ...dto, updater: user },
      { new: true },
    );
    return updated;
  }

  async setActiveAdminConfig(id: string, user?: string) {
    // 读取当前配置状态
    const current = await this.adminConfigModel.findById(id).exec();
    if (!current) {
      throw new BadRequestException('配置不存在');
    }

    const nextActive = !current.isActive;

    // 如果要启用该配置，先将其他配置全部置为未启用，保证同时只有一个启用
    if (nextActive) {
      await this.adminConfigModel.updateMany({}, { isActive: false });
    }

    const updated = await this.adminConfigModel.findByIdAndUpdate(
      id,
      { isActive: nextActive, updater: user },
      { new: true },
    );
    return updated;
  }

  async deleteAdminConfig(id: string) {
    const config = await this.adminConfigModel.findById(id);
    if (config?.isActive) {
      throw new BadRequestException('不能删除当前激活的配置');
    }
    return this.adminConfigModel.findByIdAndUpdate(id, { isDelete: true });
  }

  async getAdminConfigDetail(id: string) {
    return this.adminConfigModel.findById(id).exec();
  }

  // 用户配置相关方法
  async getUserConfigs(
    userId: string,
    query: { page?: number; pageSize?: number; q?: string },
  ) {
    const { page = 1, pageSize = 10, q } = query;
    const finder: any = { userId };

    if (q) {
      finder.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const data = await this.userConfigModel
      .find(finder)
      .select('-config')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    const total = await this.userConfigModel.countDocuments(finder);

    return Response.page(data, { page, pageSize, total });
  }

  async getUserDefaultConfig(userId: string) {
    // 先查找用户的默认配置
    const userConfig = await this.userConfigModel
      .findOne({
        userId,
        isDefault: true,
      })
      .select('config')
      .exec();

    if (userConfig) {
      return userConfig;
    }

    // 如果用户没有默认配置，返回系统激活的配置
    return this.getActiveAdminConfig();
  }

  async createUserConfig(
    userId: string,
    dto: CreateUserDesktopConfigDto,
    userRoleIds: string[] = [],
  ) {
    // 检查用户配置数量限制
    const currentCount = await this.userConfigModel.countDocuments({ userId });
    await this.userLimitService.checkUserConfigLimit(
      userId,
      userRoleIds,
      currentCount,
    );

    // 检查单个配置的分页数量限制
    const pageCount = this.getPageCountFromConfig(dto?.config);
    await this.userLimitService.checkUserConfigPagesLimit(
      userRoleIds,
      pageCount,
    );

    // 如果设置为默认配置，需要先将用户其他配置设为非默认
    if (dto.isDefault) {
      await this.userConfigModel.updateMany({ userId }, { isDefault: false });
    }

    const created = await this.userConfigModel.create({
      ...dto,
      userId,
      creator: userId,
    });
    return created;
  }

  async updateUserConfig(
    id: string,
    userId: string,
    dto: UpdateUserDesktopConfigDto,
    userRoleIds: string[] = [],
  ) {
    // 验证配置是否属于当前用户
    const config = await this.userConfigModel.findOne({ _id: id, userId });
    if (!config) {
      throw new ForbiddenException('无权限操作此配置');
    }

    // 如果设置为默认配置，需要先将用户其他配置设为非默认
    if (dto.isDefault) {
      await this.userConfigModel.updateMany(
        { userId, _id: { $ne: id } },
        { isDefault: false },
      );
    }

    // 如果更新包含配置 JSON，则校验分页数量限制
    if (typeof dto.config !== 'undefined') {
      const pageCount = this.getPageCountFromConfig(dto.config);
      await this.userLimitService.checkUserConfigPagesLimit(
        userRoleIds,
        pageCount,
      );
    }

    const updated = await this.userConfigModel.findByIdAndUpdate(
      id,
      { ...dto, updater: userId },
      { new: true },
    );
    return updated;
  }

  async setDefaultUserConfig(id: string, userId: string, isDefault: boolean) {
    // 验证配置是否属于当前用户
    const config = await this.userConfigModel.findOne({ _id: id, userId });
    if (!config) {
      throw new ForbiddenException('无权限操作此配置');
    }

    if (isDefault) {
      // 先将用户所有配置设为非默认
      await this.userConfigModel.updateMany({ userId }, { isDefault: false });
    }

    const updated = await this.userConfigModel.findByIdAndUpdate(
      id,
      { isDefault, updater: userId },
      { new: true },
    );
    return updated;
  }

  async deleteUserConfig(id: string, userId: string) {
    // 验证配置是否属于当前用户
    const config = await this.userConfigModel.findOne({ _id: id, userId });
    if (!config) {
      throw new ForbiddenException('无权限操作此配置');
    }

    return this.userConfigModel.findByIdAndUpdate(id, { isDelete: true });
  }

  async getUserConfigDetail(id: string, userId: string) {
    return this.userConfigModel.findOne({ _id: id, userId }).exec();
  }
}
