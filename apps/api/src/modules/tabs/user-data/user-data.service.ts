import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersName } from '../../users/schemas/ref-names';
import { Response } from '../../../utils/response';
import { UserLimitService } from '../desktop/user-limit/user-limit.service';

const DESKTOP_LIST_STORAGE_KEY = 'SEARCH_NEXT_DESKTOP_LIST';
const USER_DATA_SYNC_MODEL_NAME = 'UserDataSync';
const APP_MODEL_NAME = 'App';

export type UserDataPluginSummary = {
  appId: string;
  name?: string;
  version?: string;
  count: number;
};

@Injectable()
export class UserDataService {
  constructor(
    @InjectModel(USER_DATA_SYNC_MODEL_NAME)
    private readonly syncModel: Model<any>,
    @InjectModel(APP_MODEL_NAME)
    private readonly appModel: Model<any>,
    @InjectModel(UsersName)
    private readonly userModel: Model<any>,
    private readonly userLimitService: UserLimitService,
  ) {}

  async getSync(userId: string, userRoles: any[] = []) {
    this.assertUser(userId);

    const backups = (await this.syncModel
      .find({ userId })
      .sort({ lastSyncedAt: -1 })
      .lean()
      .exec()) as any;
    const limit = await this.userLimitService.getUserLimitForRoles(userRoles);
    const maxSyncBackups = limit.maxSyncBackups ?? 1;
    const latest = backups[0] ?? null;

    return {
      hasSynced: backups.length > 0,
      payload: latest?.payload ?? null,
      backups: backups.map((doc: any) => this.toUserBackup(doc)),
      byteSize: latest?.byteSize ?? 0,
      itemCount: latest?.itemCount ?? 0,
      pluginSummary: latest?.pluginSummary ?? [],
      lastSyncedAt: latest?.lastSyncedAt ?? null,
      versionCount: backups.length,
      maxSyncBackups,
      overLimit: backups.length > maxSyncBackups,
      canCreate: backups.length < maxSyncBackups,
      updatedAt: latest?.updatedAt,
    };
  }

  async saveSync(
    userId: string,
    payload: Record<string, any>,
    options?: {
      backupId?: string;
      name?: string;
      userRoles?: any[];
    },
  ) {
    this.assertUser(userId);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new BadRequestException('同步数据格式不正确');
    }

    const now = new Date();
    const pluginSummary = await this.buildPluginSummary(payload);
    const byteSize = Buffer.byteLength(JSON.stringify(payload), 'utf8');
    const itemCount = Object.keys(this.getPayloadItems(payload)).length;
    const updatePayload = {
      name: this.resolveBackupName(options?.name, now),
      userId,
      payload,
      byteSize,
      itemCount,
      pluginSummary,
      lastSyncedAt: now,
      updater: userId,
      isDelete: false,
    };

    if (options?.backupId) {
      if (!Types.ObjectId.isValid(options.backupId)) {
        throw new BadRequestException('云备份版本ID不正确');
      }
      const doc = await this.syncModel
        .findOneAndUpdate(
          { _id: options.backupId, userId },
          { $set: updatePayload },
          { new: true },
        )
        .lean()
        .exec();
      if (!doc) throw new BadRequestException('云备份版本不存在');
    } else {
      const currentCount = await this.syncModel.countDocuments({ userId });
      await this.userLimitService.checkUserSyncBackupLimit(
        options?.userRoles ?? [],
        currentCount,
      );
      await this.syncModel.create({
        ...updatePayload,
        creator: userId,
      });
    }

    return this.getSync(userId, options?.userRoles ?? []);
  }

  async renameSyncBackup(
    userId: string,
    id: string,
    name: string,
    userRoles: any[] = [],
  ) {
    this.assertUser(userId);
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('云备份版本ID不正确');
    }

    const trimmed = name?.trim();
    if (!trimmed) {
      throw new BadRequestException('云备份名称不能为空');
    }

    const updated = await this.syncModel
      .findOneAndUpdate(
        { _id: id, userId },
        {
          $set: {
            name: trimmed.slice(0, 100),
            updater: userId,
          },
        },
        { new: true },
      )
      .select('_id')
      .lean()
      .exec();
    if (!updated) throw new BadRequestException('云备份版本不存在');

    return this.getSync(userId, userRoles);
  }

  async getAdminSyncList(query: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 10);
    const finder: Record<string, any> = {};

    if (query.search) {
      const regex = new RegExp(this.escapeRegex(query.search), 'i');
      const users = await this.userModel
        .find({
          $or: [{ username: regex }, { email: regex }, { nickname: regex }],
          isDelete: { $in: [false, null] },
        })
        .select('_id')
        .lean()
        .exec();
      finder.userId = { $in: users.map((user: any) => user._id) };
    }

    const allVersions = await this.syncModel
      .find(finder)
      .select('-payload')
      .populate('userId', 'username email nickname roles')
      .sort({ lastSyncedAt: -1 })
      .lean()
      .exec();

    const grouped = new Map<string, any>();
    for (const item of allVersions) {
      const user = item.userId;
      const userKey = String(user?._id ?? item.userId);
      const existing = grouped.get(userKey);
      if (existing) {
        existing.versionCount += 1;
        existing.totalByteSize += item.byteSize ?? 0;
        continue;
      }

      grouped.set(userKey, {
        _id: userKey,
        hasSynced: true,
        user: user
          ? {
              _id: user._id,
              username: user.username,
              email: user.email,
              nickname: user.nickname,
            }
          : null,
        userRoles: user?.roles ?? [],
        latestBackupId: item._id,
        latestBackupName: item.name,
        versionCount: 1,
        totalByteSize: item.byteSize ?? 0,
        byteSize: item.byteSize ?? 0,
        itemCount: item.itemCount ?? 0,
        pluginSummary: item.pluginSummary ?? [],
        lastSyncedAt: item.lastSyncedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }

    const rows = await Promise.all(
      [...grouped.values()].map(async (item) => {
        const limit = await this.userLimitService.getUserLimitForRoles(
          item.userRoles,
        );
        const maxSyncBackups = limit.maxSyncBackups ?? 1;
        const { userRoles, ...safeItem } = item;
        return {
          ...safeItem,
          maxSyncBackups,
          overLimit: item.versionCount > maxSyncBackups,
        };
      }),
    );
    const total = rows.length;
    const data = rows.slice((page - 1) * pageSize, page * pageSize);

    return Response.page(data, { page, pageSize, total });
  }

  async getAdminUserVersions(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('用户ID不正确');
    }

    return this.syncModel
      .find({ userId })
      .select('-payload')
      .sort({ lastSyncedAt: -1 })
      .lean()
      .exec();
  }

  async deleteAdminVersion(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('云备份版本ID不正确');
    }

    const deleted = await this.syncModel
      .findByIdAndUpdate(id, { isDelete: true }, { new: true })
      .select('-payload')
      .lean()
      .exec();
    if (!deleted) throw new BadRequestException('云备份版本不存在');
    return deleted;
  }

  private assertUser(userId?: string) {
    if (!userId) {
      throw new UnauthorizedException('用户未登录');
    }
  }

  private getPayloadItems(payload: Record<string, any>): Record<string, any> {
    const items = payload.items;
    if (!items || typeof items !== 'object' || Array.isArray(items)) {
      return {};
    }
    return items;
  }

  private toUserBackup(doc: any) {
    return {
      _id: doc._id,
      name: doc.name,
      payload: doc.payload,
      byteSize: doc.byteSize ?? 0,
      itemCount: doc.itemCount ?? 0,
      pluginSummary: doc.pluginSummary ?? [],
      lastSyncedAt: doc.lastSyncedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private resolveBackupName(name: string | undefined, now: Date) {
    const trimmed = name?.trim();
    if (trimmed) return trimmed.slice(0, 100);
    return `云备份 ${now.toLocaleString('zh-CN', { hour12: false })}`;
  }

  private async buildPluginSummary(
    payload: Record<string, any>,
  ): Promise<UserDataPluginSummary[]> {
    const items = this.getPayloadItems(payload);
    const desktopListRaw = items[DESKTOP_LIST_STORAGE_KEY];
    if (typeof desktopListRaw !== 'string' || !desktopListRaw.trim()) {
      return [];
    }

    let desktopList: unknown;
    try {
      desktopList = JSON.parse(desktopListRaw);
    } catch {
      return [];
    }

    const counts = new Map<string, number>();
    const visit = (node: unknown) => {
      if (!node || typeof node !== 'object') return;

      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }

      const record = node as Record<string, any>;
      const appId = this.resolveBackendAppId(record);
      if (appId) {
        counts.set(appId, (counts.get(appId) ?? 0) + 1);
      }

      if (Array.isArray(record.children)) {
        record.children.forEach(visit);
      }
    };

    visit(desktopList);
    if (!counts.size) return [];

    const appIds = [...counts.keys()];
    const apps = await this.appModel
      .find({ _id: { $in: appIds } })
      .select('name version')
      .lean()
      .exec();
    const appMap = new Map(
      apps.map((app: any) => [String(app._id), app]),
    );

    const summary: UserDataPluginSummary[] = [];
    for (const appId of appIds) {
      const app = appMap.get(appId);
      if (!app) continue;
      summary.push({
        appId,
        name: app.name,
        version: app.version,
        count: counts.get(appId) ?? 0,
      });
    }
    return summary;
  }

  private resolveBackendAppId(item: Record<string, any>) {
    const candidates = [
      this.stripAppPrefix(item.type),
      this.stripAppPrefix(item.dataType),
      item.data?.appConfig?.id,
      item.data?.widgetConfig?.id,
    ];

    const id = candidates.find(
      (candidate) =>
        typeof candidate === 'string' && Types.ObjectId.isValid(candidate),
    );
    return id ? String(id) : null;
  }

  private stripAppPrefix(value: unknown) {
    if (typeof value !== 'string') return null;
    if (value.startsWith('app-launcher:')) {
      return value.slice('app-launcher:'.length);
    }
    if (value.startsWith('app:')) return value.slice('app:'.length);
    if (value.startsWith('widget-app:')) {
      return value.slice('widget-app:'.length);
    }
    return value.startsWith('widget:') ? value.slice('widget:'.length) : null;
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
