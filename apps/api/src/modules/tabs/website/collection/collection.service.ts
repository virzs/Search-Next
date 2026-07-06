import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WebsiteCollection } from '../schemas/collection';
import { WebsiteCollectionName, WebsiteName } from '../schemas/ref-names';
import {
  WebsiteCollectionDto,
  WebsiteCollectionForAdminDto,
  WebsiteCollectionPreviewDynamicDto,
  WebsiteCollectionWebsitesPageDto,
} from '../dto/collection';
import { Response } from 'src/utils/response';
import { Website } from '../schemas/website';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(WebsiteCollectionName)
    private readonly collectionModel: Model<WebsiteCollection>,
    @InjectModel(WebsiteName)
    private readonly websiteModel: Model<Website>,
  ) {}

  private isInEffectiveRange(
    nowMs: number,
    effectiveStart?: Date,
    effectiveEnd?: Date,
  ) {
    const startMs = effectiveStart ? effectiveStart.getTime() : null;
    const endMs = effectiveEnd ? effectiveEnd.getTime() : null;
    const afterStart = startMs === null ? true : nowMs >= startMs;
    const beforeEnd = endMs === null ? true : nowMs <= endMs;
    return afterStart && beforeEnd;
  }

  private async getDynamicWebsiteIds(collection: WebsiteCollection) {
    const classifyIds = (collection as any)?.dynamic?.classifyIds ?? [];
    const sortBy = (collection as any)?.dynamic?.sortBy ?? 'createdAt';
    const sortOrder = (collection as any)?.dynamic?.sortOrder ?? 'desc';
    const limit = Number((collection as any)?.dynamic?.limit ?? 200) || 200;

    const finder: any = {
      enable: true,
      public: true,
    };

    if (Array.isArray(classifyIds) && classifyIds.length > 0) {
      finder.classify = {
        $in: classifyIds.filter((v: any) => typeof v === 'string' && v.trim()),
      };
    }

    const tagIds = (collection as any)?.dynamic?.tags ?? [];
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      finder.tags = {
        $in: tagIds.filter((v: any) => typeof v === 'string' && v.trim()),
      };
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const websites = await this.websiteModel
      .find(finder)
      .select('_id')
      .sort(sort)
      .limit(limit)
      .lean()
      .exec();

    return websites.map((w: any) => w._id as mongoose.Types.ObjectId);
  }

  private async previewDynamicWebsitesByRule(dynamic: any) {
    const classifyIds = dynamic?.classifyIds ?? [];
    const tagIds = dynamic?.tags ?? [];
    const sortBy = dynamic?.sortBy ?? 'createdAt';
    const sortOrder = dynamic?.sortOrder ?? 'desc';
    const limit = Number(dynamic?.limit ?? 200) || 200;

    const finder: any = {
      enable: true,
      public: true,
    };

    if (Array.isArray(classifyIds) && classifyIds.length > 0) {
      finder.classify = {
        $in: classifyIds.filter((v: any) => typeof v === 'string' && v.trim()),
      };
    }

    if (Array.isArray(tagIds) && tagIds.length > 0) {
      finder.tags = {
        $in: tagIds.filter((v: any) => typeof v === 'string' && v.trim()),
      };
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    return this.websiteModel
      .find(finder)
      .select('name url icon themeColor description click')
      .sort(sort)
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

    const ids = await this.getDynamicWebsiteIds(collection);
    collection.cachedWebsiteIds = ids;
    collection.cachedAt = new Date();
    await collection.save();
  }

  private async getCollectionWebsiteIds(collection: any) {
    if (collection?.type === 'dynamic') {
      await this.ensureDynamicCache(collection);
      const cached = (collection?.cachedWebsiteIds ?? []) as any[];
      return cached.map((v) => v.toString());
    }

    const websiteIdsRaw = (collection?.websites ?? []) as any[];
    return websiteIdsRaw.map((v) => v.toString());
  }

  async previewDynamic(body: WebsiteCollectionPreviewDynamicDto) {
    return this.previewDynamicWebsitesByRule(body?.dynamic);
  }

  async getCollections(query: WebsiteCollectionForAdminDto) {
    const { page = 1, pageSize = 10, search, active } = query as any;
    const finder: any = {};

    if (search) {
      finder.title = { $regex: search, $options: 'i' };
    }

    if (active === 'true') {
      const now = new Date();
      finder.enable = true;
      finder.$and = [
        {
          $or: [{ effectiveStart: null }, { effectiveStart: { $lte: now } }],
        },
        {
          $or: [{ effectiveEnd: null }, { effectiveEnd: { $gte: now } }],
        },
      ];
    }

    const data = await this.collectionModel
      .find(finder)
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .sort({ sort: 1, createdAt: -1 })
      .populate('websites')
      .exec();

    const total = await this.collectionModel.countDocuments(finder);

    return Response.page(data, { page, pageSize, total });
  }

  async createCollection(body: WebsiteCollectionDto, user: string) {
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

  async updateCollection(id: string, body: WebsiteCollectionDto, user: string) {
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
    return this.collectionModel
      .findById(id)
      .populate('websites')
      .exec();
  }

  async getAllForPublic() {
    const now = new Date();
    const collections = await this.collectionModel
      .find({
        enable: true,
        $and: [
          {
            $or: [{ effectiveStart: null }, { effectiveStart: { $lte: now } }],
          },
          {
            $or: [{ effectiveEnd: null }, { effectiveEnd: { $gte: now } }],
          },
        ],
      })
      .sort({ featured: -1, sort: 1, createdAt: -1 })
      .exec();

    if (collections.length === 0) return collections;

    const idsToFetch = new Set<string>();
    const collectionWebsiteIds: Record<string, string[]> = {};
    const collectionTotalById: Record<string, number> = {};

    for (const c of collections as any[]) {
      const websiteIds = await this.getCollectionWebsiteIds(c);
      const itemLimit = Math.max(1, Number((c as any)?.itemLimit ?? 8) || 8);
      const sliced = websiteIds.slice(0, itemLimit);
      collectionWebsiteIds[(c as any)._id.toString()] = sliced;
      collectionTotalById[(c as any)._id.toString()] = websiteIds.length;
      for (const wid of sliced) {
        idsToFetch.add(wid);
      }
    }

    const websites = await this.websiteModel
      .find({
        _id: { $in: Array.from(idsToFetch) },
        enable: true,
        public: true,
      })
      .select('name url icon themeColor description click')
      .lean()
      .exec();

    const websiteMap = new Map<string, any>();
    for (const w of websites as any[]) {
      websiteMap.set(w._id.toString(), w);
    }

    return (collections as any[]).map((c) => {
      const cid = (c as any)._id.toString();
      const ordered = (collectionWebsiteIds[cid] ?? [])
        .map((wid) => websiteMap.get(wid))
        .filter(Boolean);
      return {
        ...(typeof (c as any)?.toObject === 'function' ? (c as any).toObject() : c),
        websites: ordered,
        previewWebsites: ordered,
        total: collectionTotalById[cid] ?? ordered.length,
      };
    });
  }

  async getCollectionWebsitesPage(
    id: string,
    query: WebsiteCollectionWebsitesPageDto,
    enforceEffectiveAt = false,
  ) {
    const { page = 1, pageSize = 10 } = query;

    const collection = await this.collectionModel.findById(id).exec();
    if (!collection) {
      return {
        collection: null,
        ...Response.page([], { page, pageSize, total: 0 }),
      };
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
        return {
          collection: null,
          ...Response.page([], { page, pageSize, total: 0 }),
        };
      }
    }

    if (!collection.enable) {
      return {
        collection: null,
        ...Response.page([], { page, pageSize, total: 0 }),
      };
    }

    const websiteIds = await this.getCollectionWebsiteIds(collection);

    const websites = await this.websiteModel
      .find({
        _id: { $in: websiteIds },
        enable: true,
        public: true,
      })
      .select('name url icon themeColor description click')
      .lean()
      .exec();

    const websiteMap = new Map<string, any>();
    for (const w of websites as any[]) {
      websiteMap.set((w as any)._id.toString(), w);
    }

    const ordered = websiteIds.map((wid) => websiteMap.get(wid)).filter(Boolean);
    const total = ordered.length;

    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const data = ordered.slice(start, end);

    return {
      collection,
      ...Response.page(data, { page, pageSize, total }),
    };
  }
}
