import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Response } from "src/utils/response";
import {
  Wallpaper,
  WallpaperName,
  WallpaperType,
} from "../wallpaper/wallpaper.schema";
import {
  WallpaperCollectionDto,
  WallpaperCollectionForAdminDto,
  WallpaperCollectionPreviewDynamicDto,
  WallpaperCollectionPublicQueryDto,
  WallpaperCollectionWallpapersPageDto,
} from "./wallpaper-collection.dto";
import {
  WallpaperCollection,
  WallpaperCollectionName,
} from "./wallpaper-collection.schema";

@Injectable()
export class WallpaperCollectionService {
  constructor(
    @InjectModel(WallpaperCollectionName)
    private readonly collectionModel: Model<WallpaperCollection>,
    @InjectModel(WallpaperName)
    private readonly wallpaperModel: Model<Wallpaper>,
  ) {}

  private isInEffectiveRange(
    nowMs: number,
    effectiveStart?: Date,
    effectiveEnd?: Date,
  ) {
    const startMs = effectiveStart ? effectiveStart.getTime() : null;
    const endMs = effectiveEnd ? effectiveEnd.getTime() : null;
    return (
      (startMs === null || nowMs >= startMs) &&
      (endMs === null || nowMs <= endMs)
    );
  }

  private applyWallpaperTypeFilter(
    finder: Record<string, any>,
    wallpaperTypes?: WallpaperType[],
  ) {
    const types = Array.from(new Set(wallpaperTypes ?? []));
    if (!types.length || types.length === 3) return;
    if (types[0] === "application") {
      if (types.length === 1) {
        finder.type = "application";
        return;
      }
    }
    if (types[0] === "gradient" && types.length === 1) {
      finder.type = "gradient";
      return;
    }
    const typeConditions: Record<string, any>[] = [];
    if (types.includes("application"))
      typeConditions.push({ type: "application" });
    if (types.includes("gradient")) typeConditions.push({ type: "gradient" });
    if (types.includes("image")) {
      typeConditions.push({ type: "image" }, { type: { $exists: false } });
    }
    finder.$and = [...(finder.$and ?? []), { $or: typeConditions }];
  }

  private getDynamicFinder(dynamic: any) {
    const finder: any = { isActive: true };
    const categoryIds = Array.isArray(dynamic?.categoryIds)
      ? dynamic.categoryIds.filter(Boolean)
      : [];
    if (categoryIds.length) finder.categoryId = { $in: categoryIds };
    this.applyWallpaperTypeFilter(finder, dynamic?.wallpaperTypes);
    return finder;
  }

  private getDynamicSort(dynamic: any): Record<string, 1 | -1> {
    const sortBy = ["updatedAt", "sortOrder"].includes(dynamic?.sortBy)
      ? dynamic.sortBy
      : "createdAt";
    const sortOrder = dynamic?.sortOrder === "asc" ? 1 : -1;
    return sortBy === "sortOrder"
      ? { sortOrder, createdAt: -1 }
      : { [sortBy]: sortOrder, sortOrder: 1 };
  }

  private populateWallpaperQuery(query: any) {
    return query
      .populate("image", "name url key mimetype size")
      .populate("thumbnail", "name url key mimetype size image")
      .populate("categoryId", "name isActive sortOrder");
  }

  private serializeWallpaper(value: any) {
    const source =
      value && typeof value.toObject === "function" ? value.toObject() : value;
    const plain = { ...(source ?? {}) };
    delete plain.creator;
    delete plain.updater;
    delete plain.sourceKey;
    delete plain.isDelete;
    delete plain.__v;
    const type =
      plain?.type === "application"
        ? "application"
        : plain?.type === "gradient"
          ? "gradient"
          : "image";
    if (type === "application" && plain?.application) {
      const application = { ...plain.application };
      delete application.storageDir;
      return { ...plain, type, application };
    }
    if (type === "gradient") {
      return {
        ...plain,
        type,
        image: undefined,
        thumbnail: undefined,
        application: undefined,
      };
    }
    return { ...plain, type, application: undefined };
  }

  private serializePublicCollection(value: any) {
    const plain =
      value && typeof value.toObject === "function" ? value.toObject() : value;
    const publicCollection = { ...(plain ?? {}) };
    delete publicCollection.creator;
    delete publicCollection.updater;
    delete publicCollection.isDelete;
    delete publicCollection.__v;
    delete publicCollection.cachedWallpaperIds;
    delete publicCollection.cachedAt;
    return publicCollection;
  }

  private async getDynamicWallpaperIds(collection: WallpaperCollection) {
    const dynamic = (collection as any)?.dynamic ?? {};
    const limit = Math.max(1, Number(dynamic?.limit ?? 200) || 200);
    const wallpapers = await this.wallpaperModel
      .find(this.getDynamicFinder(dynamic))
      .select("_id")
      .sort(this.getDynamicSort(dynamic))
      .limit(limit)
      .lean()
      .exec();
    return wallpapers.map((item: any) => item._id as mongoose.Types.ObjectId);
  }

  private async previewDynamicWallpapersByRule(dynamic: any) {
    const limit = Math.max(1, Number(dynamic?.limit ?? 200) || 200);
    const wallpapers = await this.populateWallpaperQuery(
      this.wallpaperModel
        .find(this.getDynamicFinder(dynamic))
        .sort(this.getDynamicSort(dynamic))
        .limit(limit),
    )
      .lean()
      .exec();
    return wallpapers.map((item: any) => this.serializeWallpaper(item));
  }

  private async ensureDynamicCache(collection: any) {
    if (collection?.type !== "dynamic") return;
    const intervalSec = Math.max(
      1,
      Number(collection?.updateIntervalSec ?? 300) || 300,
    );
    const cachedAtMs = collection?.cachedAt
      ? new Date(collection.cachedAt).getTime()
      : null;
    const isExpired =
      cachedAtMs === null || Date.now() - cachedAtMs > intervalSec * 1000;
    if (!isExpired) return;
    collection.cachedWallpaperIds =
      await this.getDynamicWallpaperIds(collection);
    collection.cachedAt = new Date();
    await collection.save();
  }

  private async getCollectionWallpaperIds(collection: any) {
    if (collection?.type === "dynamic") {
      await this.ensureDynamicCache(collection);
      return ((collection?.cachedWallpaperIds ?? []) as any[]).map((value) =>
        value.toString(),
      );
    }
    return ((collection?.wallpapers ?? []) as any[]).map((value) =>
      (value?._id ?? value).toString(),
    );
  }

  private async findWallpapersByIds(
    wallpaperIds: string[],
    wallpaperType?: WallpaperType,
    onlyActive = true,
  ) {
    if (!wallpaperIds.length) return new Map<string, any>();
    const finder: any = { _id: { $in: wallpaperIds } };
    if (onlyActive) finder.isActive = true;
    this.applyWallpaperTypeFilter(
      finder,
      wallpaperType ? [wallpaperType] : undefined,
    );
    const wallpapers = await this.populateWallpaperQuery(
      this.wallpaperModel.find(finder),
    )
      .lean()
      .exec();
    return new Map(
      wallpapers.map((item: any) => [
        item._id.toString(),
        this.serializeWallpaper(item),
      ]),
    );
  }

  async previewDynamic(body: WallpaperCollectionPreviewDynamicDto) {
    return this.previewDynamicWallpapersByRule(body?.dynamic);
  }

  async getCollections(query: WallpaperCollectionForAdminDto) {
    const { page = 1, pageSize = 10, search, active } = query as any;
    const finder: any = {};
    if (search) finder.title = { $regex: search, $options: "i" };
    if (active === "true") {
      const now = new Date();
      finder.enable = true;
      finder.$and = [
        { $or: [{ effectiveStart: null }, { effectiveStart: { $lte: now } }] },
        { $or: [{ effectiveEnd: null }, { effectiveEnd: { $gte: now } }] },
      ];
    }
    const [data, total] = await Promise.all([
      this.collectionModel
        .find(finder)
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .sort({ featured: -1, sort: 1, createdAt: -1 })
        .populate("wallpapers", "name type isActive")
        .exec(),
      this.collectionModel.countDocuments(finder),
    ]);
    return Response.page(data, { page, pageSize, total });
  }

  async createCollection(body: WallpaperCollectionDto, user: string) {
    const { effectiveStart, effectiveEnd, enable, ...rest } = body as any;
    const doc: any = { ...rest, enable: enable ?? true, creator: user };
    if (effectiveStart) doc.effectiveStart = new Date(effectiveStart);
    if (effectiveEnd) doc.effectiveEnd = new Date(effectiveEnd);
    return this.collectionModel.create(doc);
  }

  async updateCollection(
    id: string,
    body: WallpaperCollectionDto,
    user: string,
  ) {
    const { effectiveStart, effectiveEnd, ...rest } = body as any;
    const doc: any = { ...rest, updater: user };
    if ("effectiveStart" in body) {
      doc.effectiveStart = effectiveStart ? new Date(effectiveStart) : null;
    }
    if ("effectiveEnd" in body) {
      doc.effectiveEnd = effectiveEnd ? new Date(effectiveEnd) : null;
    }
    if (body.type === "dynamic" || body.dynamic) {
      doc.cachedWallpaperIds = [];
      doc.cachedAt = null;
    }
    return this.collectionModel.findByIdAndUpdate(id, doc, { new: true });
  }

  async deleteCollection(id: string) {
    return this.collectionModel.findByIdAndUpdate(id, { isDelete: true });
  }

  async detail(id: string) {
    const collection = await this.collectionModel.findById(id).exec();
    if (!collection) return null;
    const plain = collection.toObject();
    const wallpaperIds = await this.getCollectionWallpaperIds(collection);
    const wallpaperMap = await this.findWallpapersByIds(
      wallpaperIds,
      undefined,
      collection.type === "dynamic",
    );
    return {
      ...plain,
      wallpapers: wallpaperIds
        .map((wallpaperId) => wallpaperMap.get(wallpaperId))
        .filter(Boolean),
    };
  }

  async getAllForPublic(query: WallpaperCollectionPublicQueryDto) {
    const now = new Date();
    const collections = await this.collectionModel
      .find({
        enable: true,
        $and: [
          {
            $or: [{ effectiveStart: null }, { effectiveStart: { $lte: now } }],
          },
          { $or: [{ effectiveEnd: null }, { effectiveEnd: { $gte: now } }] },
        ],
      })
      .sort({ featured: -1, sort: 1, createdAt: -1 })
      .exec();
    if (!collections.length) return [];

    const idsToFetch = new Set<string>();
    const idsByCollection: Record<string, string[]> = {};
    for (const collection of collections as any[]) {
      const ids = await this.getCollectionWallpaperIds(collection);
      idsByCollection[collection._id.toString()] = ids;
      ids.forEach((id) => idsToFetch.add(id));
    }
    const wallpaperMap = await this.findWallpapersByIds(
      Array.from(idsToFetch),
      query.wallpaperType,
    );

    return (collections as any[])
      .map((collection) => {
        const id = collection._id.toString();
        const ordered = (idsByCollection[id] ?? [])
          .map((wallpaperId) => wallpaperMap.get(wallpaperId))
          .filter(Boolean);
        const itemLimit = Math.max(1, Number(collection?.itemLimit ?? 8) || 8);
        return {
          ...this.serializePublicCollection(collection),
          wallpapers: ordered.slice(0, itemLimit),
          previewWallpapers: ordered.slice(0, itemLimit),
          total: ordered.length,
        };
      })
      .filter((collection) => collection.total > 0);
  }

  async getCollectionWallpapersPage(
    id: string,
    query: WallpaperCollectionWallpapersPageDto,
    enforceEffectiveAt = false,
  ) {
    const { page = 1, pageSize = 10, wallpaperType } = query;
    const collection = await this.collectionModel.findById(id).exec();
    if (!collection) {
      return {
        collection: null,
        ...Response.page([], { page, pageSize, total: 0 }),
      };
    }
    if (
      !collection.enable ||
      (enforceEffectiveAt &&
        !this.isInEffectiveRange(
          Date.now(),
          collection.effectiveStart,
          collection.effectiveEnd,
        ))
    ) {
      return {
        collection: null,
        ...Response.page([], { page, pageSize, total: 0 }),
      };
    }
    const wallpaperIds = await this.getCollectionWallpaperIds(collection);
    const wallpaperMap = await this.findWallpapersByIds(
      wallpaperIds,
      wallpaperType,
    );
    const ordered = wallpaperIds
      .map((wallpaperId) => wallpaperMap.get(wallpaperId))
      .filter(Boolean);
    const total = ordered.length;
    const start = (Number(page) - 1) * Number(pageSize);
    return {
      collection: this.serializePublicCollection(collection),
      ...Response.page(ordered.slice(start, start + Number(pageSize)), {
        page,
        pageSize,
        total,
      }),
    };
  }
}
