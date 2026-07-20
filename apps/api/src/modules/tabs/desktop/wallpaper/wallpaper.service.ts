import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import * as fs from "fs/promises";
import * as path from "path";
import { Model, Types } from "mongoose";
import { ResourceService } from "src/modules/resource/resource.service";
import { Response } from "src/utils/response";
import {
  ApplicationWallpaperDto,
  CreateWallpaperDto,
  WallpaperGroupQueryDto,
  UpdateWallpaperDto,
  WallpaperQueryDto,
} from "./wallpaper.dto";
import {
  Wallpaper,
  WallpaperApplicationPackage,
  WallpaperName,
} from "./wallpaper.schema";
import {
  WallpaperCategory,
  WallpaperCategoryName,
} from "../wallpaper-category/wallpaper-category.schema";

type ApplicationManifest = {
  schemaVersion: 1;
  name: string;
  version: string;
  entry: string;
  preview: string;
  author?: string;
  projectUrl?: string;
  description?: string;
};

type PreparedApplicationPackage = {
  application: WallpaperApplicationPackage;
  finalPath: string;
};

type RuntimeFileKind = "entry" | "preview" | "asset";

const WALLPAPER_PACKAGE_CONFIG_FILE = "wallpaper.config.json";
const WALLPAPER_PACKAGE_EXT = ".snwall";
const MAX_PACKAGE_SIZE = 30 * 1024 * 1024;
const MAX_UNCOMPRESSED_SIZE = 80 * 1024 * 1024;
const MAX_PACKAGE_FILES = 500;
const MAX_PREVIEW_SIZE = 5 * 1024 * 1024;
const MAX_APPLICATION_AUTHOR_LENGTH = 100;
const MAX_APPLICATION_PROJECT_URL_LENGTH = 500;
const MAX_APPLICATION_DESCRIPTION_LENGTH = 500;
const APPLICATION_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const APPLICATION_VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,31}$/;
const ALLOWED_PACKAGE_EXTENSIONS = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".map",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".ico",
  ".avif",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".mp4",
  ".webm",
  ".mp3",
  ".ogg",
  ".wav",
  ".wasm",
]);
const PREVIEW_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

@Injectable()
export class WallpaperService {
  constructor(
    @InjectModel(WallpaperName)
    private readonly wallpaperModel: Model<Wallpaper>,
    @InjectModel(WallpaperCategoryName)
    private readonly wallpaperCategoryModel: Model<WallpaperCategory>,
    private readonly resourceService: ResourceService,
  ) {}

  private ensureObjectId(id: string, message: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }

  private applyTypeFilter(
    finder: Record<string, any>,
    type?: "image" | "application",
  ) {
    if (!type) return;
    if (type === "application") {
      finder.type = "application";
      return;
    }
    finder.$and = [
      ...(finder.$and ?? []),
      { $or: [{ type: "image" }, { type: { $exists: false } }] },
    ];
  }

  private toPlain<T>(value: T): any {
    if (value && typeof (value as any).toObject === "function") {
      return (value as any).toObject();
    }
    return value;
  }

  private serializeWallpaper(value: unknown) {
    const plain = this.toPlain(value) as Record<string, any>;
    const type = plain?.type === "application" ? "application" : "image";
    if (type === "application" && plain.application) {
      const application = { ...plain.application };
      delete application.storageDir;
      return { ...plain, type, application };
    }
    return { ...plain, type, application: undefined };
  }

  private populateWallpaperQuery(query: any, includeAdmin = false) {
    if (includeAdmin) {
      query.populate("creator", "username").populate("updater", "username");
    }
    return query
      .populate("image", "name url key mimetype size")
      .populate("thumbnail", "name url key mimetype size image")
      .populate("categoryId", "name isActive sortOrder");
  }

  async getWallpapers(
    query: { page?: number; pageSize?: number } & WallpaperQueryDto,
  ) {
    const { page = 1, pageSize = 10, q, isActive, categoryId, type } = query;
    const finder: any = {};

    if (q) {
      finder.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { url: { $regex: q, $options: "i" } },
        { "application.author": { $regex: q, $options: "i" } },
        { "application.projectUrl": { $regex: q, $options: "i" } },
        { "application.description": { $regex: q, $options: "i" } },
      ];
    }
    if (typeof isActive === "boolean") finder.isActive = isActive;
    if (categoryId) {
      this.ensureObjectId(categoryId, "壁纸分类不存在");
      finder.categoryId = categoryId;
    }
    this.applyTypeFilter(finder, type);

    const data = await this.populateWallpaperQuery(
      this.wallpaperModel
        .find(finder)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize)),
      true,
    ).exec();
    const total = await this.wallpaperModel.countDocuments(finder);
    return Response.page(
      data.map((item) => this.serializeWallpaper(item)),
      {
        page,
        pageSize,
        total,
      },
    );
  }

  async getActiveWallpapers(
    query: { page?: number; pageSize?: number } & WallpaperQueryDto,
  ) {
    const { page = 1, pageSize = 10, categoryId, type } = query;
    const finder: any = { isActive: true };
    if (categoryId) {
      this.ensureObjectId(categoryId, "壁纸分类不存在");
      finder.categoryId = categoryId;
    }
    this.applyTypeFilter(finder, type);

    const data = await this.populateWallpaperQuery(
      this.wallpaperModel
        .find(finder)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize)),
    ).exec();
    const total = await this.wallpaperModel.countDocuments(finder);
    return Response.page(
      data.map((item) => this.serializeWallpaper(item)),
      {
        page,
        pageSize,
        total,
      },
    );
  }

  async getActiveWallpaperDetail(id: string) {
    this.ensureObjectId(id, "壁纸不存在");
    const wallpaper = await this.populateWallpaperQuery(
      this.wallpaperModel.findOne({ _id: id, isActive: true }),
    ).exec();
    if (!wallpaper) throw new NotFoundException("壁纸不存在或已停用");
    return this.serializeWallpaper(wallpaper);
  }

  async getActiveWallpaperCategoryGroups(query: WallpaperGroupQueryDto) {
    const {
      page = 1,
      pageSize = 10,
      categoryId,
      groupSize = 8,
      type,
    } = query as any;
    if (categoryId) this.ensureObjectId(categoryId, "壁纸分类不存在");

    const wallpaperFinder: any = {
      isActive: true,
      categoryId: { $ne: null },
      isDelete: { $in: [false, null] },
    };
    this.applyTypeFilter(wallpaperFinder, type);
    const usedCategoryIds = categoryId
      ? [new Types.ObjectId(categoryId)]
      : await this.wallpaperModel
          .distinct("categoryId", wallpaperFinder)
          .exec();

    const categoryFinder: any = {
      isActive: true,
      _id: { $in: usedCategoryIds },
    };
    const [categories, total] = await Promise.all([
      this.wallpaperCategoryModel
        .find(categoryFinder)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .exec(),
      this.wallpaperCategoryModel.countDocuments(categoryFinder),
    ]);
    if (categoryId && categories.length === 0) {
      throw new BadRequestException("壁纸分类不存在");
    }

    const groups = await Promise.all(
      categories.map(async (category) => {
        const finder: any = { isActive: true, categoryId: category._id };
        this.applyTypeFilter(finder, type);
        const [wallpapers, groupTotal] = await Promise.all([
          this.populateWallpaperQuery(
            this.wallpaperModel
              .find(finder)
              .sort({ sortOrder: 1, createdAt: -1 })
              .limit(Number(groupSize)),
          ).exec(),
          this.wallpaperModel.countDocuments(finder),
        ]);
        return {
          category,
          wallpapers: wallpapers.map((item) => this.serializeWallpaper(item)),
          total: groupTotal,
        };
      }),
    );
    return Response.page(groups, { page, pageSize, total });
  }

  async createWallpaper(dto: CreateWallpaperDto, user?: string) {
    this.ensureObjectId(dto.image, "资源不存在");
    if (dto.categoryId) {
      this.ensureObjectId(dto.categoryId, "壁纸分类不存在");
    }
    const thumbnail = await this.createThumbnail(dto.image, user);
    const created = await this.wallpaperModel.create({
      ...dto,
      type: "image",
      creator: user,
      thumbnail,
    });
    return this.getWallpaperDetail(String(created._id));
  }

  async updateWallpaper(id: string, dto: UpdateWallpaperDto, user?: string) {
    this.ensureObjectId(id, "壁纸不存在");
    if (dto.categoryId) {
      this.ensureObjectId(dto.categoryId, "壁纸分类不存在");
    }
    if (dto.image) this.ensureObjectId(dto.image, "资源不存在");

    const current = await this.wallpaperModel.findById(id).exec();
    if (!current) throw new BadRequestException("壁纸不存在");
    if (current.type === "application") {
      throw new BadRequestException("网页壁纸请使用网页壁纸包更新接口");
    }

    const updateDoc: any = { ...dto, type: "image", updater: user };
    const imageChanged =
      typeof dto.image === "string" && dto.image !== String(current.image);
    if (imageChanged) {
      if (current.thumbnail) {
        await this.resourceService.deleteFile(String(current.thumbnail));
      }
      updateDoc.thumbnail = await this.createThumbnail(dto.image, user);
    }
    const updated = await this.wallpaperModel.findByIdAndUpdate(id, updateDoc, {
      new: true,
    });
    if (!updated) throw new BadRequestException("壁纸不存在");
    return this.getWallpaperDetail(id);
  }

  async createApplicationWallpaper(
    file: Express.Multer.File,
    dto: ApplicationWallpaperDto,
    user?: string,
  ) {
    if (dto.categoryId) {
      this.ensureObjectId(dto.categoryId, "壁纸分类不存在");
    }
    const id = new Types.ObjectId();
    const prepared = await this.prepareApplicationPackage(file, String(id));
    try {
      await this.wallpaperModel.create({
        _id: id,
        type: "application",
        name: dto.name || prepared.application.packageName,
        description: dto.description || prepared.application.description,
        author: dto.author || prepared.application.author,
        url: dto.url || prepared.application.projectUrl,
        categoryId: dto.categoryId,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        application: prepared.application,
        creator: user,
      });
      return this.getWallpaperDetail(String(id));
    } catch (error) {
      await fs.rm(prepared.finalPath, { recursive: true, force: true });
      throw error;
    }
  }

  async updateApplicationWallpaper(
    id: string,
    file: Express.Multer.File | undefined,
    dto: ApplicationWallpaperDto,
    user?: string,
  ) {
    this.ensureObjectId(id, "壁纸不存在");
    if (dto.categoryId) {
      this.ensureObjectId(dto.categoryId, "壁纸分类不存在");
    }
    const current = await this.wallpaperModel.findById(id).exec();
    if (!current) throw new BadRequestException("壁纸不存在");
    if (current.type !== "application" || !current.application) {
      throw new BadRequestException("壁纸类型不可修改");
    }

    const prepared = file
      ? await this.prepareApplicationPackage(file, id)
      : undefined;
    const previousApplication = current.application;
    const packageDefaults = prepared
      ? {
          name: prepared.application.packageName,
          description: prepared.application.description,
          author: prepared.application.author,
          url: prepared.application.projectUrl,
        }
      : undefined;
    try {
      const updated = await this.wallpaperModel.findByIdAndUpdate(
        id,
        {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : packageDefaults?.description
              ? { description: packageDefaults.description }
              : {}),
          ...(dto.author !== undefined
            ? { author: dto.author }
            : packageDefaults?.author
              ? { author: packageDefaults.author }
              : {}),
          ...(dto.url !== undefined
            ? { url: dto.url }
            : packageDefaults?.url
              ? { url: packageDefaults.url }
              : {}),
          ...(dto.name === undefined && packageDefaults?.name
            ? { name: packageDefaults.name }
            : {}),
          ...(dto.categoryId !== undefined
            ? { categoryId: dto.categoryId || null }
            : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(prepared ? { application: prepared.application } : {}),
          updater: user,
        },
        { new: true },
      );
      if (!updated) throw new BadRequestException("壁纸不存在");
    } catch (error) {
      if (prepared) {
        await fs.rm(prepared.finalPath, { recursive: true, force: true });
      }
      throw error;
    }

    if (
      prepared &&
      previousApplication.storageDir !== prepared.application.storageDir
    ) {
      await this.cleanupApplicationPackage(previousApplication);
    }
    return this.getWallpaperDetail(id);
  }

  async toggleWallpaper(id: string, user?: string) {
    this.ensureObjectId(id, "壁纸不存在");
    const current = await this.wallpaperModel.findById(id).exec();
    if (!current) throw new BadRequestException("壁纸不存在");
    const updated = await this.wallpaperModel.findByIdAndUpdate(
      id,
      { isActive: !current.isActive, updater: user },
      { new: true },
    );
    if (!updated) throw new BadRequestException("壁纸不存在");
    return this.getWallpaperDetail(id);
  }

  async deleteWallpaper(id: string) {
    this.ensureObjectId(id, "壁纸不存在");
    const current = await this.wallpaperModel.findById(id).exec();
    if (!current) throw new BadRequestException("壁纸不存在");

    if (current.type === "application" && current.application) {
      await this.cleanupApplicationPackage(current.application);
    } else {
      if (current.image) {
        await this.resourceService.deleteFile(String(current.image));
      }
      if (current.thumbnail) {
        await this.resourceService.deleteFile(String(current.thumbnail));
      }
    }

    const result = await this.wallpaperModel.findByIdAndUpdate(id, {
      isDelete: true,
      isActive: false,
    });
    if (!result) throw new BadRequestException("壁纸不存在");
    return this.serializeWallpaper(result);
  }

  async getWallpaperDetail(id: string) {
    this.ensureObjectId(id, "壁纸不存在");
    const wallpaper = await this.populateWallpaperQuery(
      this.wallpaperModel.findById(id),
      true,
    ).exec();
    if (!wallpaper) throw new BadRequestException("壁纸不存在");
    return this.serializeWallpaper(wallpaper);
  }

  async getApplicationRuntimeFile(
    id: string,
    revision: string,
    kind: RuntimeFileKind,
    assetPath?: string,
  ) {
    this.ensureObjectId(id, "网页壁纸不存在");
    const finder: Record<string, unknown> = {
      _id: id,
      type: "application",
    };
    if (kind !== "preview") finder.isActive = true;
    const wallpaper = await this.wallpaperModel.findOne(finder).exec();
    if (
      !wallpaper?.application ||
      wallpaper.application.revision !== revision
    ) {
      throw new NotFoundException("网页壁纸不存在或已停用");
    }

    const application = wallpaper.application;
    const relativePath =
      kind === "entry"
        ? application.entry
        : kind === "preview"
          ? application.preview
          : this.normalizePackagePath(assetPath || "");
    this.assertSafeRelativePath(relativePath);
    if (
      kind === "asset" &&
      path.extname(relativePath).toLowerCase() === ".html"
    ) {
      throw new NotFoundException("资源不存在");
    }

    const packagePath = this.resolveApplicationStoragePath(
      application.storageDir,
    );
    const target = path.resolve(packagePath, relativePath);
    if (!target.startsWith(packagePath + path.sep)) {
      throw new NotFoundException("资源不存在");
    }

    let buffer: Buffer;
    try {
      buffer = await fs.readFile(target);
    } catch {
      throw new NotFoundException("资源不存在");
    }

    if (kind === "entry") {
      buffer = Buffer.from(this.injectRuntimeHtml(buffer.toString("utf8")));
    }
    return {
      buffer,
      contentType: this.resolveContentType(relativePath),
      headers:
        kind === "entry"
          ? {
              "Cache-Control": "no-store",
              "Content-Security-Policy": this.getRuntimeContentSecurityPolicy(),
              "Referrer-Policy": "no-referrer",
              "X-Content-Type-Options": "nosniff",
            }
          : {
              "Cache-Control": "public, max-age=31536000, immutable",
              "Access-Control-Allow-Origin": "*",
              "Cross-Origin-Resource-Policy": "cross-origin",
              "X-Content-Type-Options": "nosniff",
            },
    };
  }

  private parseApplicationManifest(entries: AdmZip.IZipEntry[]) {
    const configEntry = entries.find(
      (entry) =>
        this.normalizePackagePath(entry.entryName) ===
        WALLPAPER_PACKAGE_CONFIG_FILE,
    );
    if (!configEntry) {
      throw new BadRequestException("网页壁纸包缺少 wallpaper.config.json");
    }

    let raw: unknown;
    try {
      raw = JSON.parse(configEntry.getData().toString("utf8"));
    } catch {
      throw new BadRequestException("wallpaper.config.json 格式不正确");
    }
    if (!raw || typeof raw !== "object") {
      throw new BadRequestException("wallpaper.config.json 格式不正确");
    }
    const record = raw as Record<string, unknown>;
    if (record.schemaVersion !== 1) {
      throw new BadRequestException("仅支持 schemaVersion 1");
    }
    if (
      typeof record.name !== "string" ||
      !APPLICATION_NAME_PATTERN.test(record.name)
    ) {
      throw new BadRequestException("网页壁纸包 name 格式不正确");
    }
    if (
      typeof record.version !== "string" ||
      !APPLICATION_VERSION_PATTERN.test(record.version)
    ) {
      throw new BadRequestException("网页壁纸包 version 格式不正确");
    }
    if (
      typeof record.entry !== "string" ||
      typeof record.preview !== "string"
    ) {
      throw new BadRequestException("网页壁纸包缺少 entry 或 preview");
    }

    const author = this.parseOptionalManifestText(
      record.author,
      "author",
      MAX_APPLICATION_AUTHOR_LENGTH,
    );
    const projectUrl = this.parseApplicationProjectUrl(record.projectUrl);
    const description = this.parseOptionalManifestText(
      record.description,
      "description",
      MAX_APPLICATION_DESCRIPTION_LENGTH,
    );

    const entry = this.normalizePackagePath(record.entry);
    const preview = this.normalizePackagePath(record.preview);
    this.assertSafeRelativePath(entry);
    this.assertSafeRelativePath(preview);
    if (path.extname(entry).toLowerCase() !== ".html") {
      throw new BadRequestException("网页壁纸入口必须是 HTML 文件");
    }
    if (!PREVIEW_EXTENSIONS.has(path.extname(preview).toLowerCase())) {
      throw new BadRequestException("预览图仅支持 PNG、JPEG 或 WebP");
    }

    const entryFile = entries.find(
      (item) => this.normalizePackagePath(item.entryName) === entry,
    );
    const previewFile = entries.find(
      (item) => this.normalizePackagePath(item.entryName) === preview,
    );
    if (!entryFile)
      throw new BadRequestException(`网页壁纸包缺少入口: ${entry}`);
    if (!previewFile) {
      throw new BadRequestException(`网页壁纸包缺少预览图: ${preview}`);
    }
    if (Number(previewFile.header?.size ?? 0) > MAX_PREVIEW_SIZE) {
      throw new BadRequestException("网页壁纸预览图不能超过 5MB");
    }

    const htmlFiles = entries.filter(
      (item) =>
        path
          .extname(this.normalizePackagePath(item.entryName))
          .toLowerCase() === ".html",
    );
    if (htmlFiles.length !== 1) {
      throw new BadRequestException("网页壁纸包只能包含一个 HTML 文件");
    }
    return {
      schemaVersion: 1,
      name: record.name,
      version: record.version,
      entry,
      preview,
      author,
      projectUrl,
      description,
    } satisfies ApplicationManifest;
  }

  private parseOptionalManifestText(
    value: unknown,
    field: string,
    maxLength: number,
  ) {
    if (value === undefined) return undefined;
    if (typeof value !== "string") {
      throw new BadRequestException(`网页壁纸包 ${field} 格式不正确`);
    }
    const normalized = value.trim();
    if (!normalized || normalized.length > maxLength) {
      throw new BadRequestException(`网页壁纸包 ${field} 格式不正确`);
    }
    return normalized;
  }

  private parseApplicationProjectUrl(value: unknown) {
    const normalized = this.parseOptionalManifestText(
      value,
      "projectUrl",
      MAX_APPLICATION_PROJECT_URL_LENGTH,
    );
    if (!normalized) return undefined;
    try {
      const url = new URL(normalized);
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        !url.hostname
      ) {
        throw new Error("invalid project URL");
      }
      return url.toString();
    } catch {
      throw new BadRequestException("网页壁纸包 projectUrl 必须是 HTTPS 地址");
    }
  }

  private validatePackageEntries(entries: AdmZip.IZipEntry[]) {
    if (!entries.length) throw new BadRequestException("网页壁纸包为空");
    if (entries.length > MAX_PACKAGE_FILES) {
      throw new BadRequestException(
        `网页壁纸包文件数不能超过 ${MAX_PACKAGE_FILES}`,
      );
    }

    let uncompressedSize = 0;
    const normalizedPaths = new Set<string>();
    for (const entry of entries) {
      const normalized = this.normalizePackagePath(entry.entryName);
      this.assertSafeRelativePath(normalized);
      const duplicateKey = normalized.toLowerCase();
      if (normalizedPaths.has(duplicateKey)) {
        throw new BadRequestException(`网页壁纸包包含重复路径: ${normalized}`);
      }
      normalizedPaths.add(duplicateKey);

      const unixMode = (Number(entry.attr ?? 0) >>> 16) & 0o170000;
      if (unixMode === 0o120000) {
        throw new BadRequestException("网页壁纸包不能包含符号链接");
      }
      const extension = path.extname(normalized).toLowerCase();
      if (!ALLOWED_PACKAGE_EXTENSIONS.has(extension)) {
        throw new BadRequestException(
          `网页壁纸包不支持该文件类型: ${extension || normalized}`,
        );
      }
      uncompressedSize += Number(entry.header?.size ?? 0);
      if (uncompressedSize > MAX_UNCOMPRESSED_SIZE) {
        throw new BadRequestException("网页壁纸包解压后不能超过 80MB");
      }
    }
  }

  private async prepareApplicationPackage(
    file: Express.Multer.File,
    wallpaperId: string,
  ): Promise<PreparedApplicationPackage> {
    if (!file) throw new BadRequestException("请上传 .snwall 网页壁纸包");
    if (!file.originalname?.toLowerCase().endsWith(WALLPAPER_PACKAGE_EXT)) {
      throw new BadRequestException("仅支持 .snwall 网页壁纸包");
    }
    if (!file.buffer?.length || file.size > MAX_PACKAGE_SIZE) {
      throw new BadRequestException("网页壁纸包不能超过 30MB");
    }

    let zip: AdmZip;
    try {
      zip = new AdmZip(file.buffer);
    } catch {
      throw new BadRequestException("网页壁纸包不是有效的 ZIP 文件");
    }
    const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
    this.validatePackageEntries(entries);
    const manifest = this.parseApplicationManifest(entries);
    const revision = randomUUID();
    const storageDir = `${wallpaperId}/${revision}`;
    const storageRoot = this.getApplicationStorageRoot();
    const wallpaperRoot = path.resolve(storageRoot, wallpaperId);
    const stagePath = path.resolve(wallpaperRoot, `.${revision}.tmp`);
    const finalPath = this.resolveApplicationStoragePath(storageDir);
    await fs.mkdir(stagePath, { recursive: true });

    try {
      for (const entry of entries) {
        const relativePath = this.normalizePackagePath(entry.entryName);
        const target = path.resolve(stagePath, relativePath);
        if (!target.startsWith(stagePath + path.sep)) {
          throw new BadRequestException("网页壁纸包包含非法路径");
        }
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, entry.getData());
      }
      await fs.rename(stagePath, finalPath);
    } catch (error) {
      await fs.rm(stagePath, { recursive: true, force: true });
      await fs.rm(finalPath, { recursive: true, force: true });
      throw error;
    }

    return {
      application: {
        packageName: manifest.name,
        version: manifest.version,
        entry: manifest.entry,
        preview: manifest.preview,
        author: manifest.author,
        projectUrl: manifest.projectUrl,
        description: manifest.description,
        revision,
        storageDir,
      },
      finalPath,
    };
  }

  private getApplicationStorageRoot() {
    const configured = process.env.wallpaper_application_storage_path;
    if (configured) return path.resolve(configured);
    const uploadRoot = path.resolve(
      process.env.local_storage_path || "./assets/uploads",
    );
    return path.resolve(path.dirname(uploadRoot), "wallpaper-applications");
  }

  private resolveApplicationStoragePath(storageDir: string) {
    const root = this.getApplicationStorageRoot();
    const target = path.resolve(root, storageDir);
    if (!target.startsWith(root + path.sep)) {
      throw new BadRequestException("网页壁纸存储路径不正确");
    }
    return target;
  }

  private async cleanupApplicationPackage(
    application: WallpaperApplicationPackage,
  ) {
    const target = this.resolveApplicationStoragePath(application.storageDir);
    await fs.rm(target, { recursive: true, force: true });
  }

  private normalizePackagePath(value: string) {
    return String(value || "")
      .replace(/\\/g, "/")
      .replace(/^\.\//, "");
  }

  private assertSafeRelativePath(value: string) {
    const normalized = this.normalizePackagePath(value);
    const segments = normalized.split("/");
    if (
      !normalized ||
      normalized.includes("\0") ||
      normalized.startsWith("/") ||
      /^[A-Za-z]:\//.test(normalized) ||
      path.isAbsolute(normalized) ||
      segments.some(
        (segment) => !segment || segment === "." || segment === "..",
      )
    ) {
      throw new BadRequestException("网页壁纸包包含非法路径");
    }
  }

  private injectRuntimeHtml(html: string) {
    const bootstrap = `<base href="./assets/"><script>(function(){var CHANNEL='search-next-wallpaper-v1';function emit(type,payload){parent.postMessage({channel:CHANNEL,type:type,payload:payload},'*')}function apply(payload){if(!payload||typeof payload!=='object')return;var root=document.documentElement;if(payload.theme)root.dataset.theme=payload.theme;if(payload.language){root.lang=payload.language;root.dataset.language=payload.language}root.dataset.reducedMotion=payload.reducedMotion?'true':'false';root.dataset.visible=payload.visible===false?'false':'true';window.dispatchEvent(new CustomEvent('search-next-wallpaper-environment',{detail:payload}))}addEventListener('message',function(event){var data=event.data;if(data&&data.channel===CHANNEL&&data.type==='environment')apply(data.payload)});addEventListener('keydown',function(event){emit('keydown',{key:event.key,code:event.code,metaKey:event.metaKey,ctrlKey:event.ctrlKey,altKey:event.altKey,shiftKey:event.shiftKey,repeat:event.repeat})},true);addEventListener('beforeunload',function(){emit('navigating',{})});function ready(){emit('ready',{})}if(document.readyState==='loading')addEventListener('DOMContentLoaded',ready,{once:true});else ready()})();</script>`;
    const headMatch = html.match(/<head(?:\s[^>]*)?>/i);
    if (headMatch?.index !== undefined) {
      const insertAt = headMatch.index + headMatch[0].length;
      return `${html.slice(0, insertAt)}${bootstrap}${html.slice(insertAt)}`;
    }
    return `<!doctype html><html><head>${bootstrap}</head><body>${html}</body></html>`;
  }

  private getRuntimeContentSecurityPolicy() {
    return [
      "default-src 'none'",
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "media-src 'self' data: blob:",
      "connect-src 'none'",
      "frame-src 'none'",
      "child-src 'none'",
      "object-src 'none'",
      "form-action 'none'",
      "navigate-to 'none'",
      "base-uri 'self'",
    ].join("; ");
  }

  private resolveContentType(filePath: string) {
    const extension = path.extname(filePath).toLowerCase();
    const types: Record<string, string> = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".mjs": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".map": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".avif": "image/avif",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".otf": "font/otf",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".ogg": "audio/ogg",
      ".wav": "audio/wav",
      ".wasm": "application/wasm",
    };
    return types[extension] || "application/octet-stream";
  }

  private async createThumbnail(resourceId: string, user?: string) {
    const created = await this.resourceService.processImageOne(
      resourceId,
      {
        variant: {
          outputName: "thumbnail.webp",
          resize: { width: 480, withoutEnlargement: true },
          format: "webp",
          quality: 80,
        },
      },
      user,
    );
    return created._id;
  }
}
