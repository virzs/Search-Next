import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Response } from 'src/utils/response';
import { App, AppName } from '../app/schemas/app.schema';
import {
  AppCollection,
  AppCollectionName,
} from './schemas/app-collection.schema';
import {
  AppCollectionDto,
  AppCollectionForAdminDto,
  AppCollectionPreviewDynamicDto,
  AppCollectionAppsPageDto,
} from './dto/app-collection.dto';

@Injectable()
export class AppCollectionService {
  constructor(
    @InjectModel(AppCollectionName)
    private readonly collectionModel: Model<AppCollection>,
    @InjectModel(AppName)
    private readonly appModel: Model<App>,
  ) {}

  private isInEffectiveRange(
    nowMs: number,
    effectiveStart?: Date,
    effectiveEnd?: Date,
  ) {
    const startMs = effectiveStart ? effectiveStart.getTime() : null;
    const endMs = effectiveEnd ? effectiveEnd.getTime() : null;
    return (startMs === null || nowMs >= startMs) && (endMs === null || nowMs <= endMs);
  }

  private getDynamicFinder(dynamic: any) {
    const classifyIds = dynamic?.classifyIds ?? [];
    const finder: any = {
      enable: true,
      supportAppMode: true,
    };

    if (Array.isArray(classifyIds) && classifyIds.length > 0) {
      finder.classify = {
        $in: classifyIds.filter((v: any) => typeof v === 'string' && v.trim()),
      };
    }

    return finder;
  }

  private getDynamicSort(dynamic: any): Record<string, 1 | -1> {
    const sortBy = dynamic?.sortBy === 'updatedAt' ? 'updatedAt' : 'createdAt';
    const sortOrder = dynamic?.sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrder, sortOrder: 1 };
  }

  private async getDynamicAppIds(collection: AppCollection) {
    const dynamic = (collection as any)?.dynamic ?? {};
    const limit = Number(dynamic?.limit ?? 200) || 200;

    const apps = await this.appModel
      .find(this.getDynamicFinder(dynamic))
      .select('_id')
      .sort(this.getDynamicSort(dynamic))
      .limit(limit)
      .lean()
      .exec();

    return apps.map((w: any) => w._id as mongoose.Types.ObjectId);
  }

  private async previewDynamicAppsByRule(dynamic: any) {
    const limit = Number(dynamic?.limit ?? 200) || 200;
    return this.appModel
      .find(this.getDynamicFinder(dynamic))
      .populate('classify', 'name')
      .populate('icon', 'url')
      .sort(this.getDynamicSort(dynamic))
      .limit(limit)
      .lean()
      .exec();
  }

  private async ensureDynamicCache(collection: any) {
    if (collection?.type !== 'dynamic') return;

    const intervalSec = Number(collection?.updateIntervalSec ?? 300) || 300;
    const cachedAtMs = collection?.cachedAt
      ? new Date(collection.cachedAt).getTime()
      : null;
    const nowMs = Date.now();
    const isExpired = cachedAtMs === null ? true : nowMs - cachedAtMs > intervalSec * 1000;
    if (!isExpired) return;

    const ids = await this.getDynamicAppIds(collection);
    collection.cachedAppIds = ids;
    collection.cachedAt = new Date();
    await collection.save();
  }

  private async getCollectionAppIds(collection: any) {
    if (collection?.type === 'dynamic') {
      await this.ensureDynamicCache(collection);
      const cached = (collection?.cachedAppIds ?? []) as any[];
      return cached.map((v) => v.toString());
    }

    const appIdsRaw = (collection?.apps ?? []) as any[];
    return appIdsRaw.map((v) => v.toString());
  }

  private async findAppsByIds(appIds: string[]) {
    const apps = await this.appModel
      .find({
        _id: { $in: appIds },
        enable: true,
        supportAppMode: true,
      })
      .populate('classify', 'name')
      .populate('icon', 'url')
      .lean()
      .exec();

    const map = new Map<string, any>();
    for (const app of apps as any[]) {
      map.set(app._id.toString(), app);
    }
    return map;
  }

  async previewDynamic(body: AppCollectionPreviewDynamicDto) {
    return this.previewDynamicAppsByRule(body?.dynamic);
  }

  async getCollections(query: AppCollectionForAdminDto) {
    const { page = 1, pageSize = 10, search, active } = query as any;
    const finder: any = {};

    if (search) finder.title = { $regex: search, $options: 'i' };

    if (active === 'true') {
      const now = new Date();
      finder.enable = true;
      finder.$and = [
        { $or: [{ effectiveStart: null }, { effectiveStart: { $lte: now } }] },
        { $or: [{ effectiveEnd: null }, { effectiveEnd: { $gte: now } }] },
      ];
    }

    const data = await this.collectionModel
      .find(finder)
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .sort({ featured: -1, sort: 1, createdAt: -1 })
      .populate('apps')
      .exec();

    const total = await this.collectionModel.countDocuments(finder);
    return Response.page(data, { page, pageSize, total });
  }

  async createCollection(body: AppCollectionDto, user: string) {
    const { effectiveStart, effectiveEnd, enable, ...rest } = body as any;
    const doc: any = {
      ...rest,
      enable: enable ?? true,
      creator: user,
    };

    if (effectiveStart) doc.effectiveStart = new Date(effectiveStart);
    if (effectiveEnd) doc.effectiveEnd = new Date(effectiveEnd);
    return this.collectionModel.create(doc);
  }

  async updateCollection(id: string, body: AppCollectionDto, user: string) {
    const { effectiveStart, effectiveEnd, ...rest } = body as any;
    const doc: any = {
      ...rest,
      updater: user,
    };

    if ('effectiveStart' in body) {
      doc.effectiveStart = effectiveStart ? new Date(effectiveStart) : undefined;
    }
    if ('effectiveEnd' in body) {
      doc.effectiveEnd = effectiveEnd ? new Date(effectiveEnd) : undefined;
    }

    return this.collectionModel.findByIdAndUpdate(id, doc, { new: true });
  }

  async deleteCollection(id: string) {
    return this.collectionModel.findByIdAndUpdate(id, { isDelete: true });
  }

  async detail(id: string) {
    return this.collectionModel.findById(id).populate('apps').exec();
  }

  async getAllForPublic() {
    const now = new Date();
    const collections = await this.collectionModel
      .find({
        enable: true,
        $and: [
          { $or: [{ effectiveStart: null }, { effectiveStart: { $lte: now } }] },
          { $or: [{ effectiveEnd: null }, { effectiveEnd: { $gte: now } }] },
        ],
      })
      .sort({ featured: -1, sort: 1, createdAt: -1 })
      .exec();

    if (!collections.length) return collections;

    const idsToFetch = new Set<string>();
    const collectionAppIds: Record<string, string[]> = {};
    const collectionTotalById: Record<string, number> = {};

    for (const collection of collections as any[]) {
      const appIds = await this.getCollectionAppIds(collection);
      const itemLimit = Math.max(1, Number(collection?.itemLimit ?? 8) || 8);
      const sliced = appIds.slice(0, itemLimit);
      collectionAppIds[collection._id.toString()] = sliced;
      collectionTotalById[collection._id.toString()] = appIds.length;
      for (const wid of sliced) idsToFetch.add(wid);
    }

    const appMap = await this.findAppsByIds(Array.from(idsToFetch));

    return (collections as any[]).map((collection) => {
      const cid = collection._id.toString();
      const ordered = (collectionAppIds[cid] ?? [])
        .map((wid) => appMap.get(wid))
        .filter(Boolean);
      return {
        ...(typeof collection?.toObject === 'function'
          ? collection.toObject()
          : collection),
        apps: ordered,
        previewApps: ordered,
        total: collectionTotalById[cid] ?? ordered.length,
      };
    });
  }

  async getCollectionAppsPage(
    id: string,
    query: AppCollectionAppsPageDto,
    enforceEffectiveAt = false,
  ) {
    const { page = 1, pageSize = 10 } = query;
    const collection = await this.collectionModel.findById(id).exec();

    if (!collection) {
      return { collection: null, ...Response.page([], { page, pageSize, total: 0 }) };
    }

    if (enforceEffectiveAt) {
      const ok =
        collection.enable === true &&
        this.isInEffectiveRange(
          Date.now(),
          collection.effectiveStart,
          collection.effectiveEnd,
        );
      if (!ok) {
        return { collection: null, ...Response.page([], { page, pageSize, total: 0 }) };
      }
    }

    if (!collection.enable) {
      return { collection: null, ...Response.page([], { page, pageSize, total: 0 }) };
    }

    const appIds = await this.getCollectionAppIds(collection);
    const appMap = await this.findAppsByIds(appIds);
    const ordered = appIds.map((wid) => appMap.get(wid)).filter(Boolean);
    const total = ordered.length;
    const start = (Number(page) - 1) * Number(pageSize);
    const data = ordered.slice(start, start + Number(pageSize));

    return { collection, ...Response.page(data, { page, pageSize, total }) };
  }
}
