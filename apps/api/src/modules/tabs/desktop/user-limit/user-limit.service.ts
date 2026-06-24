import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserConfigLimit,
  UserConfigLimitName,
} from './schemas/user-config-limit.schema';
import {
  CreateUserConfigLimitDto,
  UpdateUserConfigLimitDto,
} from './dto/user-limit.dto';

@Injectable()
export class UserLimitService {
  constructor(
    @InjectModel(UserConfigLimitName)
    private readonly userConfigLimitModel: Model<UserConfigLimit>,
  ) {}

  async getUserConfigLimit() {
    let config = await this.userConfigLimitModel
      .findOne()
      .populate('roleConfigs.role', 'name description')
      .exec();

    // 如果没有配置，创建默认配置
    if (!config) {
      config = await this.userConfigLimitModel.create({
        defaultMaxConfigs: 5,
        defaultMaxPages: 10,
        defaultMaxSyncBackups: 1,
        roleConfigs: [],
        description: '默认用户桌面配置数量限制',
      });
    }

    return config;
  }

  // 根据用户角色返回有效的限制（未登录或无角色则返回默认限制）
  async getUserLimitForRoles(userRoles?: string[]) {
    const config = await this.getUserConfigLimit();

    let maxConfigs = config.defaultMaxConfigs;
    let maxPages = config.defaultMaxPages;
    let maxSyncBackups =
      typeof config.defaultMaxSyncBackups === 'number'
        ? config.defaultMaxSyncBackups
        : 1;
    let source: 'default' | 'role' = 'default';

    const roleIds = Array.isArray(userRoles)
      ? userRoles.map((r: any) =>
          typeof r === 'string' ? r : (r?._id?.toString() ?? r?.toString()),
        )
      : [];

    if (roleIds.length > 0 && Array.isArray(config.roleConfigs)) {
      const matched = config.roleConfigs.find((rc: any) =>
        roleIds.includes(rc.role._id.toString()),
      );
      if (matched) {
        maxConfigs = matched.maxConfigs;
        maxPages =
          typeof matched.maxPages === 'number' ? matched.maxPages : maxPages;
        maxSyncBackups =
          typeof matched.maxSyncBackups === 'number'
            ? matched.maxSyncBackups
            : maxSyncBackups;
        source = 'role';
      }
    }

    return {
      maxConfigs,
      maxPages,
      maxSyncBackups,
      source,
    };
  }

  async createOrUpdateUserConfigLimit(
    dto: CreateUserConfigLimitDto,
    user?: string,
  ) {
    // 检查是否已存在配置
    const existingConfig = await this.userConfigLimitModel.findOne().exec();

    if (existingConfig) {
      // 更新现有配置
      const updated = await this.userConfigLimitModel
        .findByIdAndUpdate(
          existingConfig._id,
          { ...dto, updater: user },
          { new: true },
        )
        .populate('roleConfigs.role', 'name description');
      return updated;
    } else {
      // 创建新配置
      const created = await this.userConfigLimitModel.create({
        ...dto,
        creator: user,
      });
      // 重新查询以获取populate的数据
      return this.userConfigLimitModel
        .findById(created._id)
        .populate('roleConfigs.role', 'name description')
        .exec();
    }
  }

  async updateUserConfigLimit(dto: UpdateUserConfigLimitDto, user?: string) {
    const config = await this.userConfigLimitModel.findOne().exec();

    if (!config) {
      throw new BadRequestException('配置不存在，请先创建配置');
    }

    const updated = await this.userConfigLimitModel
      .findByIdAndUpdate(config._id, { ...dto, updater: user }, { new: true })
      .populate('roleConfigs.role', 'name description');
    return updated;
  }

  // 检查用户配置数量限制
  async checkUserConfigLimit(
    userId: string,
    userRoleIds: string[] = [],
    currentCount: number,
  ) {
    const config = await this.getUserConfigLimit();

    let maxConfigs = config.defaultMaxConfigs; // 默认限制

    // 检查是否有针对用户角色的特殊限制
    if (userRoleIds && userRoleIds.length > 0) {
      for (const userRoleId of userRoleIds) {
        const roleConfig = config.roleConfigs.find(
          (rc) => rc.role.toString() === userRoleId,
        );
        if (roleConfig) {
          // 使用找到的第一个匹配角色的限制（可以根据需要调整优先级逻辑）
          maxConfigs = roleConfig.maxConfigs;
          break;
        }
      }
    }

    if (currentCount >= maxConfigs) {
      throw new BadRequestException(`用户最多只能创建 ${maxConfigs} 个配置`);
    }

    return maxConfigs;
  }

  // 检查单个配置中的分页数量限制
  async checkUserConfigPagesLimit(
    userRoleIds: string[] = [],
    pageCount: number,
  ) {
    const config = await this.getUserConfigLimit();

    let maxPages = config.defaultMaxPages; // 默认限制

    // 检查是否有针对用户角色的特殊限制
    if (userRoleIds && userRoleIds.length > 0) {
      for (const userRoleId of userRoleIds) {
        const roleConfig = config.roleConfigs.find(
          (rc) => rc.role.toString() === userRoleId,
        );
        if (roleConfig && typeof roleConfig.maxPages === 'number') {
          maxPages = roleConfig.maxPages;
          break;
        }
      }
    }

    if (pageCount > maxPages) {
      throw new BadRequestException(`单个配置最多支持 ${maxPages} 个分页`);
    }

    return maxPages;
  }

  async checkUserSyncBackupLimit(
    userRoleIds: string[] = [],
    currentCount: number,
  ) {
    const { maxSyncBackups } = await this.getUserLimitForRoles(userRoleIds);

    if (currentCount >= maxSyncBackups) {
      throw new BadRequestException(
        `云备份最多只能保存 ${maxSyncBackups} 个版本，请选择已有版本覆盖`,
      );
    }

    return maxSyncBackups;
  }
}
