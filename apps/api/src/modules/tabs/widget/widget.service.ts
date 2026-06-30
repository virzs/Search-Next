import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import AdmZip from 'adm-zip';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Response } from 'src/utils/response';
import { Widget, WidgetName } from './schemas/widget.schema';
import { ResourceService } from 'src/modules/resource/resource.service';
import { WidgetDto, WidgetQueryDto } from './dto/widget.dto';
import {
  WidgetVersion,
  WidgetVersionName,
} from './schemas/widget-version.schema';

type WidgetSizeConfig = { row: number; col: number; name: string; id: string };
type WidgetSettingsType = 'input' | 'select' | 'switch' | 'textarea' | 'number';
type PopulatedResource = { name?: string; url?: string };
type WidgetAppIcon = { type: 'image' | 'custom'; src?: string };
type WidgetPagePaths = { settings?: string };
type WidgetScreenshot = {
  mode?: string;
  themeId: string;
  sizeId: string;
  width?: number;
  height?: number;
  file: string;
  url: string;
};
type WidgetScreenshotManifestCapture = {
  mode?: unknown;
  themeId?: unknown;
  sizeId?: unknown;
  width?: unknown;
  height?: unknown;
  file?: unknown;
};
type WidgetPackageConfig = {
  schemaVersion?: string;
  name: string;
  displayName?: string;
  version: string;
  description?: string;
  author?: string;
  entry: string;
  icon?: string;
  appIcon?: WidgetAppIcon;
  tags?: string[];
  sizeConfigs: WidgetSizeConfig[];
  defaultSizeId: string;
  supportIconMode?: boolean;
  supportAppMode?: boolean;
  appIconUrl?: string;
  pagePaths?: WidgetPagePaths;
  settingsEntry?: string;
  settingsSchema?: Record<string, unknown>[];
};
type WidgetVersionPayload = {
  widget: unknown;
  name: string;
  version: string;
  packageName: string;
  packageKey: string;
  packageUrl: string;
  entryFileName: string;
  entryUrl: string;
  iconUrl?: string;
  appIcon?: WidgetAppIcon;
  appIconUrl?: string;
  screenshots: WidgetScreenshot[];
  configSnapshot: Record<string, unknown>;
};
type WidgetConfigPayload = {
  entryFileName?: unknown;
  files?: unknown;
  sizeConfigs?: Partial<WidgetSizeConfig>[];
  defaultSizeId?: unknown;
  appIcon?: unknown;
  pagePaths?: unknown;
  settingsSchema?: unknown;
};
type WidgetListQuery = WidgetQueryDto & {
  page?: number;
  pageSize?: number;
  classify?: string;
  search?: string;
  tag?: string;
};
type WidgetPublicResponse = Record<string, unknown> & {
  entryFileName?: string;
  dir?: string;
  files?: PopulatedResource[];
  icon?: PopulatedResource;
  sizeConfigs?: WidgetSizeConfig[];
  defaultSizeId?: string;
  supportIconMode?: boolean;
  supportAppMode?: boolean;
  appIcon?: WidgetAppIcon;
  appIconUrl?: string;
  pagePaths?: WidgetPagePaths;
  settingsSchema?: Record<string, unknown>[];
  tags?: string[];
  version?: string;
  author?: string;
  screenshots?: WidgetScreenshot[];
  packageSourceName?: string;
  packageName?: string;
  entryUrl?: string;
  iconUrl?: string;
  configSnapshot?: Record<string, unknown>;
};

const WIDGET_PACKAGE_CONFIG_FILE = 'widget.config.json';
const WIDGET_SCREENSHOTS_MANIFEST_FILE = 'screenshots/manifest.json';
const SNWIDGET_EXT = '.snwidget';
const SCREENSHOT_IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
]);

@Injectable()
export class WidgetService {
  constructor(
    @InjectModel(WidgetName) private readonly widgetModel: Model<Widget>,
    @InjectModel(WidgetVersionName)
    private readonly widgetVersionModel: Model<WidgetVersion>,
    private readonly resourceService: ResourceService,
  ) {}

  async list(query: WidgetQueryDto) {
    const { page = 1, pageSize = 10, classify, search, tag } =
      query as WidgetListQuery;

    // 构建分页查询条件
    const conditions: any = {};
    if (classify) conditions.classify = classify;
    if (search) conditions.name = { $regex: search, $options: 'i' };
    // 支持按标签精确筛选
    if (tag) conditions.tags = tag;

    const list = await this.widgetModel
      .find(conditions)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('classify', 'name')
      .populate('icon', 'url')
      .exec();

    const total = await this.widgetModel.countDocuments(conditions);
    return Response.page(list, { page, pageSize, total });
  }

  /**
   * 获取所有已启用的小组件列表（公开接口，供前端应用调用）
   * 按 sortOrder 升序、创建时间降序排列
   */
  async listPublic() {
    const list = await this.widgetModel
      .find({ enable: true })
      .populate('classify', 'name')
      .populate('icon', 'url')
      .populate('previewImages', 'name url key mimetype size')
      .populate('files', 'name url key mimetype size')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .exec();

    return Promise.all(
      list.map((item) =>
        this.withPublicResponseFields(item as WidgetPublicResponse),
      ),
    );
  }

  async listVersions(widgetId: string) {
    await this.ensureWidget(widgetId);
    const versions = await this.widgetVersionModel
      .find({ widget: widgetId })
      .sort({ active: -1, updatedAt: -1, createdAt: -1 })
      .exec();
    return this.dedupeVersionRows(versions);
  }

  async importPackage(file: Express.Multer.File, user?: string, widgetId?: string) {
    if (!file) throw new BadRequestException('请上传.snwidget包');
    if (!file.originalname?.endsWith(SNWIDGET_EXT)) {
      throw new BadRequestException('仅支持.snwidget后缀的小组件包');
    }

    const zip = new AdmZip(file.buffer);
    const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
    const configEntry = entries.find(
      (entry) => this.normalizeZipPath(entry.entryName) === WIDGET_PACKAGE_CONFIG_FILE,
    );
    if (!configEntry) {
      throw new BadRequestException('小组件包缺少widget.config.json');
    }

    const config = this.parsePackageConfig(configEntry.getData());
    const entryName = this.normalizeZipPath(config.entry);
    const entryFile = entries.find(
      (entry) => this.normalizeZipPath(entry.entryName) === entryName,
    );
    if (!entryFile) {
      throw new BadRequestException(`小组件包缺少入口文件: ${config.entry}`);
    }
    if (config.icon) {
      const iconName = this.normalizeZipPath(config.icon);
      const iconFile = entries.find(
        (entry) => this.normalizeZipPath(entry.entryName) === iconName,
      );
      if (!iconFile) {
        throw new BadRequestException(`小组件包缺少图标文件: ${config.icon}`);
      }
    }
    const appIconPath = this.getPackageAppIconPath(config);
    if (appIconPath) {
      this.assertSafeRelativePath(appIconPath);
      const appIconFile = entries.find(
        (entry) => this.normalizeZipPath(entry.entryName) === appIconPath,
      );
      if (!appIconFile) {
        throw new BadRequestException(`小组件包缺少应用图标文件: ${appIconPath}`);
      }
    }

    const baseKey = `widgets/${config.name}/${config.version}`;
    await this.writePackageEntries(entries, baseKey);

    const screenshots = this.parsePackageScreenshots(entries, baseKey);
    const appIconUrl = this.getPackageAppIconUrl(config, baseKey);
    const configSnapshot = this.buildConfigSnapshot(
      config,
      screenshots,
      appIconUrl,
    );
    const widget = await this.upsertPackageWidget(
      config,
      screenshots,
      appIconUrl,
      `/static/${baseKey}/${entryName}`,
      config.icon ? `/static/${baseKey}/${this.normalizeZipPath(config.icon)}` : undefined,
      user,
      widgetId,
    );
    const packageName = `${config.name}-${config.version}${SNWIDGET_EXT}`;
    const versionDoc = await this.upsertPackageVersion({
      widget: widget._id,
      name: config.name,
      version: config.version,
      packageName,
      packageKey: `${baseKey}/${packageName}`,
      packageUrl: `/static/${baseKey}/${packageName}`,
      entryFileName: config.entry,
      entryUrl: `/static/${baseKey}/${entryName}`,
      iconUrl: config.icon ? `/static/${baseKey}/${this.normalizeZipPath(config.icon)}` : undefined,
      appIcon: config.appIcon,
      appIconUrl,
      screenshots,
      configSnapshot,
    }, user);

    await fs.writeFile(
      this.getLocalStoragePath(`${baseKey}/${packageName}`),
      file.buffer,
    );

    const publishedWidget = await this.publishVersion(
      String(widget._id),
      String(versionDoc._id),
      user,
    );

    const responseWidget = await this.withPublicResponseFields(
      (typeof (publishedWidget as any).toObject === 'function'
        ? (publishedWidget as any).toObject()
        : publishedWidget) as WidgetPublicResponse,
    );

    return { widget: responseWidget, version: versionDoc };
  }

  async publishVersion(widgetId: string, versionId: string, user?: string) {
    const widget = await this.ensureWidget(widgetId);
    const version = await this.widgetVersionModel
      .findOne({ _id: versionId, widget: widgetId })
      .exec();
    if (!version) throw new NotFoundException('小组件版本不存在');

    await this.widgetVersionModel.updateMany(
      { widget: widgetId },
      { active: false, updater: user },
    );
    await this.widgetVersionModel.findByIdAndUpdate(versionId, {
      active: true,
      updater: user,
    });

    const snapshot = version.configSnapshot as WidgetPackageConfig;
    return this.widgetModel.findByIdAndUpdate(
      widget._id,
      {
        version: version.version,
        activeVersion: version._id,
        sourceType: 'snwidget',
        packageName: version.packageName,
        entryFileName: version.entryFileName,
        entryUrl: version.entryUrl,
        iconUrl: version.iconUrl,
        supportAppMode: snapshot.supportAppMode ?? false,
        appIcon: snapshot.appIcon,
        appIconUrl: snapshot.appIconUrl ?? version.appIconUrl,
        pagePaths: snapshot.pagePaths ?? null,
        configSnapshot: version.configSnapshot,
        sizeConfigs: snapshot.sizeConfigs,
        defaultSizeId: snapshot.defaultSizeId,
        supportIconMode: snapshot.supportIconMode ?? false,
        settingsSchema: snapshot.settingsSchema ?? [],
        tags: snapshot.tags ?? [],
        author: snapshot.author,
        screenshots: version.screenshots ?? [],
        updater: user,
      },
      { new: true },
    );
  }

  /**
   * 获取单个小组件详情（公开接口）
   * 包含完整的资源URL信息
   */
  async detailPublic(id: string) {
    const item = await this.widgetModel
      .findOne({ _id: id, enable: true })
      .populate('classify', 'name')
      .populate('icon', 'url')
      .populate('previewImages', 'name url key mimetype size')
      .populate('files', 'name url key mimetype size')
      .lean()
      .exec();
    if (!item) throw new NotFoundException('小组件不存在或未启用');
    return this.withPublicResponseFields(item as WidgetPublicResponse);
  }

  async create(dto: WidgetDto, user?: string) {
    this.validateWidgetConfig(dto, true);
    const created = await this.widgetModel.create({ ...dto, creator: user });
    const resourceIds = [...(dto.previewImages ?? []), ...(dto.files ?? [])];
    if (resourceIds.length) {
      await this.resourceService.associateDataAndResource({
        resourceIds,
        associatedDataId: String(created._id),
        associatedDataFrom: WidgetName,
      });
    }
    return created;
  }

  async update(id: string, dto: Partial<WidgetDto>, user?: string) {
    const old = await this.widgetModel.findById(id).exec();
    if (!old) throw new NotFoundException('小组件不存在');
    this.validateWidgetConfig(
      { ...old.toObject(), ...dto } as WidgetConfigPayload,
      false,
    );
    const updated = await this.widgetModel.findByIdAndUpdate(
      id,
      { ...dto, updater: user },
      { new: true },
    );
    if (!updated) throw new NotFoundException('小组件不存在');

    const oldPreview = (old.previewImages ?? []).map((v: any) => String(v));
    const oldFiles = (old.files ?? []).map((v: any) => String(v));
    const newPreview = (updated.previewImages ?? []).map((v: any) => String(v));
    const newFiles = (updated.files ?? []).map((v: any) => String(v));

    const oldSet = Array.from(new Set([...oldPreview, ...oldFiles]));
    const newSet = Array.from(new Set([...newPreview, ...newFiles]));

    const removed = oldSet.filter((x) => !newSet.includes(x));
    const addedPreview = newPreview.filter((x) => !oldSet.includes(x));
    const addedFiles = newFiles.filter((x) => !oldSet.includes(x));
    const added = Array.from(new Set([...addedPreview, ...addedFiles]));

    if (removed.length) {
      await Promise.all(
        removed.map((rid) => this.resourceService.deleteFile(rid)),
      );
      await this.resourceService.disassociateDataAndResource(
        String(id),
        removed,
      );
    }
    if (added.length) {
      await this.resourceService.associateDataAndResource({
        resourceIds: added,
        associatedDataId: String(id),
        associatedDataFrom: WidgetName,
      });
    }

    return updated;
  }

  async detail(id: string) {
    const item = await this.widgetModel
      .findById(id)
      .populate('icon', 'url')
      .populate('previewImages', 'name url key mimetype size')
      .populate('files', 'name url key mimetype size')
      .lean()
      .exec();
    if (!item) throw new NotFoundException('小组件不存在');
    return this.withPublicResponseFields(item as WidgetPublicResponse);
  }

  async delete(id: string) {
    const res = await this.widgetModel.findByIdAndUpdate(id, {
      isDelete: true,
    });
    if (!res) throw new NotFoundException('小组件不存在');
    return res;
  }

  private validateWidgetConfig(dto: WidgetConfigPayload, isCreate: boolean) {
    if (isCreate || dto.entryFileName !== undefined) {
      if (!this.isNonEmptyString(dto.entryFileName)) {
        throw new BadRequestException('入口文件名称不能为空');
      }
    }

    const fileItems: unknown[] = Array.isArray(dto.files) ? dto.files : [];
    const namedFiles = fileItems.filter((file): file is PopulatedResource => {
      return this.isRecord(file) && this.isNonEmptyString(file.name);
    });
    if (
      namedFiles.length &&
      !namedFiles.some((file) => file.name === dto.entryFileName)
    ) {
      throw new BadRequestException('入口文件名称必须匹配已上传文件名称');
    }

    if (dto.sizeConfigs !== undefined) {
      this.validateSizeConfigs(dto.sizeConfigs);
    }

    if (dto.defaultSizeId !== undefined) {
      if (!this.isNonEmptyString(dto.defaultSizeId)) {
        throw new BadRequestException('默认尺寸ID不能为空');
      }
      const sizeConfigs = dto.sizeConfigs;
      if (
        Array.isArray(sizeConfigs) &&
        !sizeConfigs.some((item) => item.id === dto.defaultSizeId)
      ) {
        throw new BadRequestException('默认尺寸ID必须存在于尺寸配置中');
      }
    }

    if (dto.appIcon !== undefined) {
      this.normalizeAppIcon(dto.appIcon);
    }

    if (dto.pagePaths !== undefined) {
      this.normalizePagePaths(dto.pagePaths);
    }

    if (dto.settingsSchema !== undefined) {
      this.validateSettingsSchema(dto.settingsSchema);
    }
  }

  private validateSizeConfigs(sizeConfigs: Partial<WidgetSizeConfig>[]) {
    if (!Array.isArray(sizeConfigs) || sizeConfigs.length === 0) {
      throw new BadRequestException('尺寸配置不能为空');
    }

    sizeConfigs.forEach((item) => {
      if (
        !this.isNonEmptyString(item?.id) ||
        !this.isNonEmptyString(item?.name)
      ) {
        throw new BadRequestException('尺寸配置ID和名称不能为空');
      }
      if (
        !this.isPositiveInteger(item?.row) ||
        !this.isPositiveInteger(item?.col)
      ) {
        throw new BadRequestException('尺寸配置行列必须大于等于1');
      }
    });
  }

  private validateSettingsSchema(settingsSchema: unknown) {
    if (!Array.isArray(settingsSchema)) {
      throw new BadRequestException('设置表单Schema必须为数组');
    }

    const validTypes: WidgetSettingsType[] = [
      'input',
      'select',
      'switch',
      'textarea',
      'number',
    ];

    settingsSchema.forEach((item: unknown) => {
      if (!this.isRecord(item)) {
        throw new BadRequestException('设置表单Schema项必须为对象');
      }
      if (
        !this.isNonEmptyString(item.key) ||
        !this.isNonEmptyString(item.label) ||
        !this.isNonEmptyString(item.type) ||
        !validTypes.includes(item.type as WidgetSettingsType)
      ) {
        throw new BadRequestException(
          '设置表单Schema项必须包含有效的key、label和type',
        );
      }
      if (item.type === 'select' && !Array.isArray(item.options)) {
        throw new BadRequestException('select类型设置项必须提供options数组');
      }
    });
  }

  private normalizeAppIcon(
    appIcon: unknown,
    supportAppMode = false,
  ): WidgetAppIcon | undefined {
    if (appIcon == null) {
      return supportAppMode ? { type: 'image' } : undefined;
    }
    if (!this.isRecord(appIcon)) {
      throw new BadRequestException('应用图标配置必须为对象');
    }
    if (appIcon.type === 'custom') {
      return { type: 'custom' };
    }
    if (appIcon.type === 'image') {
      const src = this.isNonEmptyString(appIcon.src)
        ? this.normalizeZipPath(appIcon.src)
        : undefined;
      return src ? { type: 'image', src } : { type: 'image' };
    }
    throw new BadRequestException('应用图标类型仅支持image或custom');
  }

  private normalizePagePaths(pagePaths: unknown): WidgetPagePaths | undefined {
    if (pagePaths == null) return undefined;
    if (!this.isRecord(pagePaths)) {
      throw new BadRequestException('页面路径配置必须为对象');
    }

    const normalized: WidgetPagePaths = {};
    if (pagePaths.settings !== undefined) {
      if (!this.isNonEmptyString(pagePaths.settings)) {
        throw new BadRequestException('设置页面路径不能为空');
      }
      normalized.settings = this.normalizeRoutePath(pagePaths.settings);
    }

    return Object.keys(normalized).length ? normalized : undefined;
  }

  private normalizeRoutePath(value: string) {
    const routePath = value.trim();
    if (
      routePath !== value ||
      !routePath.startsWith('/') ||
      routePath.startsWith('//') ||
      routePath.includes('\\') ||
      routePath.includes('..') ||
      /[\s]/.test(routePath) ||
      /^[a-z][a-z0-9+.-]*:/i.test(routePath)
    ) {
      throw new BadRequestException('页面路径必须是安全的站内路由');
    }
    return routePath;
  }

  private getPackageAppIconPath(config: WidgetPackageConfig) {
    if (config.appIcon?.type !== 'image') return undefined;
    const appIconSrc = this.isNonEmptyString(config.appIcon.src)
      ? config.appIcon.src
      : config.icon;
    return this.isNonEmptyString(appIconSrc)
      ? this.normalizeZipPath(appIconSrc)
      : undefined;
  }

  private getPackageAppIconUrl(config: WidgetPackageConfig, baseKey: string) {
    const appIconPath = this.getPackageAppIconPath(config);
    return appIconPath ? `/static/${baseKey}/${appIconPath}` : undefined;
  }

  private parsePackageConfig(buffer: Buffer): WidgetPackageConfig {
    let raw: unknown;
    try {
      raw = JSON.parse(buffer.toString('utf8'));
    } catch {
      throw new BadRequestException('widget.config.json格式不正确');
    }
    if (!this.isRecord(raw)) {
      throw new BadRequestException('widget.config.json必须为对象');
    }

    const config = raw as Partial<WidgetPackageConfig>;
    if (!this.isNonEmptyString(config.name)) {
      throw new BadRequestException('widget.config.json缺少name');
    }
    if (!this.isNonEmptyString(config.version)) {
      throw new BadRequestException('widget.config.json缺少version');
    }
    if (!this.isNonEmptyString(config.entry)) {
      throw new BadRequestException('widget.config.json缺少entry');
    }
    this.assertSafeRelativePath(config.entry);
    if (config.icon) this.assertSafeRelativePath(config.icon);
    if (config.settingsEntry) this.assertSafeRelativePath(config.settingsEntry);
    const pagePaths = this.normalizePagePaths(config.pagePaths);
    const supportAppMode = config.supportAppMode === true;
    const appIcon = this.normalizeAppIcon(config.appIcon, supportAppMode);
    if (appIcon?.type === 'image' && appIcon.src) {
      this.assertSafeRelativePath(appIcon.src);
    }

    this.validateWidgetConfig(
      {
        entryFileName: config.entry,
        sizeConfigs: config.sizeConfigs,
        defaultSizeId: config.defaultSizeId,
        settingsSchema: config.settingsSchema ?? [],
      },
      true,
    );

    return {
      schemaVersion: config.schemaVersion,
      name: config.name,
      displayName: config.displayName,
      version: config.version,
      description: config.description,
      author: config.author,
      entry: config.entry,
      icon: config.icon,
      tags: Array.isArray(config.tags) ? config.tags : [],
      sizeConfigs: config.sizeConfigs ?? [],
      defaultSizeId: config.defaultSizeId ?? '',
      supportIconMode: config.supportIconMode ?? false,
      supportAppMode,
      appIcon,
      pagePaths,
      settingsEntry: config.settingsEntry,
      settingsSchema: config.settingsSchema ?? [],
    };
  }

  private buildConfigSnapshot(
    config: WidgetPackageConfig,
    screenshots: WidgetScreenshot[] = [],
    appIconUrl?: string,
  ) {
    return {
      schemaVersion: config.schemaVersion,
      name: config.name,
      displayName: config.displayName,
      version: config.version,
      description: config.description,
      author: config.author,
      entry: config.entry,
      icon: config.icon,
      tags: config.tags ?? [],
      sizeConfigs: config.sizeConfigs,
      defaultSizeId: config.defaultSizeId,
      supportIconMode: config.supportIconMode ?? false,
      supportAppMode: config.supportAppMode ?? false,
      appIcon: config.appIcon,
      appIconUrl,
      pagePaths: config.pagePaths ?? null,
      settingsEntry: config.settingsEntry,
      settingsSchema: config.settingsSchema ?? [],
      screenshots,
    };
  }

  private dedupeVersionRows<T extends { version?: string }>(versions: T[]) {
    const seen = new Set<string>();
    return versions.filter((item) => {
      const key = item.version;
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async upsertPackageVersion(
    payload: WidgetVersionPayload,
    user?: string,
  ) {
    const existingVersions = await this.widgetVersionModel
      .find({ widget: payload.widget, version: payload.version })
      .sort({ active: -1, updatedAt: -1, createdAt: -1 })
      .exec();
    const existing = existingVersions[0];

    if (existing) {
      const updated = await this.widgetVersionModel
        .findByIdAndUpdate(
          existing._id,
          {
            ...payload,
            active: false,
            updater: user,
          },
          { new: true },
        )
        .exec();
      if (!updated) throw new NotFoundException('小组件版本不存在');

      const duplicateIds = existingVersions.slice(1).map((item) => item._id);
      if (duplicateIds.length) {
        await this.widgetVersionModel
          .updateMany(
            { _id: { $in: duplicateIds } },
            { active: false, isDelete: true, updater: user },
          )
          .exec();
      }
      return updated;
    }

    return this.widgetVersionModel.create({
      ...payload,
      active: false,
      creator: user,
    });
  }

  private async upsertPackageWidget(
    config: WidgetPackageConfig,
    screenshots: WidgetScreenshot[],
    appIconUrl: string | undefined,
    entryUrl: string,
    iconUrl: string | undefined,
    user?: string,
    widgetId?: string,
  ) {
    const existing = widgetId
      ? await this.ensureWidget(widgetId)
      : await this.widgetModel.findOne({ packageSourceName: config.name }).exec();
    const payload = {
      name: config.displayName || config.name,
      description: config.description,
      entryFileName: config.entry,
      version: config.version,
      author: config.author,
      sourceType: 'snwidget',
      packageSourceName: config.name,
      packageName: `${config.name}-${config.version}${SNWIDGET_EXT}`,
      entryUrl,
      iconUrl,
      sizeConfigs: config.sizeConfigs,
      defaultSizeId: config.defaultSizeId,
      supportIconMode: config.supportIconMode ?? false,
      supportAppMode: config.supportAppMode ?? false,
      appIcon: config.appIcon,
      appIconUrl,
      pagePaths: config.pagePaths ?? null,
      tags: config.tags ?? [],
      settingsSchema: config.settingsSchema ?? [],
      screenshots,
      configSnapshot: this.buildConfigSnapshot(config, screenshots, appIconUrl),
    };
    if (existing) {
      const updated = await this.widgetModel.findByIdAndUpdate(
        existing._id,
        { ...payload, updater: user },
        { new: true },
      );
      if (!updated) throw new NotFoundException('小组件不存在');
      return updated;
    }
    return this.widgetModel.create({ ...payload, creator: user });
  }

  private parsePackageScreenshots(
    entries: AdmZip.IZipEntry[],
    baseKey: string,
  ): WidgetScreenshot[] {
    const entryMap = new Map(
      entries.map((entry) => [this.normalizeZipPath(entry.entryName), entry]),
    );
    const manifestEntry = entryMap.get(WIDGET_SCREENSHOTS_MANIFEST_FILE);
    if (manifestEntry) {
      return this.parseScreenshotManifest(
        manifestEntry.getData(),
        entryMap,
        baseKey,
      );
    }

    return this.inferScreenshotsFromFiles(entries, baseKey);
  }

  private parseScreenshotManifest(
    buffer: Buffer,
    entryMap: Map<string, AdmZip.IZipEntry>,
    baseKey: string,
  ): WidgetScreenshot[] {
    let raw: unknown;
    try {
      raw = JSON.parse(buffer.toString('utf8'));
    } catch {
      throw new BadRequestException('screenshots/manifest.json格式不正确');
    }
    if (!this.isRecord(raw) || !Array.isArray(raw.captures)) {
      throw new BadRequestException('screenshots/manifest.json缺少captures数组');
    }

    return raw.captures
      .map((capture: WidgetScreenshotManifestCapture) =>
        this.normalizeScreenshotCapture(capture, entryMap, baseKey),
      )
      .filter((capture): capture is WidgetScreenshot => Boolean(capture));
  }

  private normalizeScreenshotCapture(
    capture: WidgetScreenshotManifestCapture,
    entryMap: Map<string, AdmZip.IZipEntry>,
    baseKey: string,
  ): WidgetScreenshot | null {
    if (!this.isRecord(capture)) return null;
    if (
      !this.isNonEmptyString(capture.file) ||
      !this.isNonEmptyString(capture.themeId) ||
      !this.isNonEmptyString(capture.sizeId)
    ) {
      return null;
    }

    const file = this.normalizeZipPath(capture.file);
    this.assertSafeRelativePath(file);
    if (!entryMap.has(file)) {
      throw new BadRequestException(`截图文件不存在: ${file}`);
    }

    const normalized: WidgetScreenshot = {
      mode: this.isNonEmptyString(capture.mode) ? capture.mode : undefined,
      themeId: capture.themeId,
      sizeId: capture.sizeId,
      file,
      url: `/static/${baseKey}/${file}`,
    };
    if (this.isPositiveInteger(capture.width)) normalized.width = capture.width;
    if (this.isPositiveInteger(capture.height)) normalized.height = capture.height;
    return normalized;
  }

  private normalizeStoredScreenshotCapture(
    capture: WidgetScreenshotManifestCapture,
    baseKey: string,
  ): WidgetScreenshot | null {
    if (!this.isRecord(capture)) return null;
    if (
      !this.isNonEmptyString(capture.file) ||
      !this.isNonEmptyString(capture.themeId) ||
      !this.isNonEmptyString(capture.sizeId)
    ) {
      return null;
    }

    const file = this.normalizeZipPath(capture.file);
    this.assertSafeRelativePath(file);

    const normalized: WidgetScreenshot = {
      mode: this.isNonEmptyString(capture.mode) ? capture.mode : undefined,
      themeId: capture.themeId,
      sizeId: capture.sizeId,
      file,
      url: `/static/${baseKey}/${file}`,
    };
    if (this.isPositiveInteger(capture.width)) normalized.width = capture.width;
    if (this.isPositiveInteger(capture.height)) normalized.height = capture.height;
    return normalized;
  }

  private inferScreenshotsFromFiles(
    entries: AdmZip.IZipEntry[],
    baseKey: string,
  ): WidgetScreenshot[] {
    return entries
      .map((entry) => this.normalizeZipPath(entry.entryName))
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return file.startsWith('screenshots/') && SCREENSHOT_IMAGE_EXTENSIONS.has(ext);
      })
      .map((file): WidgetScreenshot | null => {
        this.assertSafeRelativePath(file);
        const basename = path.basename(file, path.extname(file));
        const themeMatch = basename.match(/(?:^|-)(light|dark)(?:$|-)/i);
        const sizeMatch = basename.match(/(\d+x\d+)/i);
        if (!sizeMatch) return null;

        const screenshot: WidgetScreenshot = {
          mode: file.split('/')[1],
          themeId: themeMatch?.[1]?.toLowerCase() ?? 'light',
          sizeId: sizeMatch[1].toLowerCase(),
          file,
          url: `/static/${baseKey}/${file}`,
        };
        return screenshot;
      })
      .filter((capture): capture is WidgetScreenshot => Boolean(capture));
  }

  private async ensureWidget(widgetId: string) {
    if (!Types.ObjectId.isValid(widgetId)) {
      throw new BadRequestException('小组件ID不正确');
    }
    const widget = await this.widgetModel.findById(widgetId).exec();
    if (!widget) throw new NotFoundException('小组件不存在');
    return widget;
  }

  private async writePackageEntries(entries: AdmZip.IZipEntry[], baseKey: string) {
    for (const entry of entries) {
      const relativePath = this.normalizeZipPath(entry.entryName);
      this.assertSafeRelativePath(relativePath);
      const target = this.getLocalStoragePath(`${baseKey}/${relativePath}`);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, entry.getData());
    }
  }

  private getLocalStoragePath(key: string) {
    const basePath = process.env.local_storage_path || './assets/uploads';
    const target = path.resolve(basePath, key);
    const base = path.resolve(basePath);
    if (!target.startsWith(base + path.sep)) {
      throw new BadRequestException('非法文件路径');
    }
    return target;
  }

  private normalizeZipPath(value: string) {
    return value.replace(/\\/g, '/').replace(/^\.\//, '');
  }

  private assertSafeRelativePath(value: string) {
    const normalized = this.normalizeZipPath(value);
    if (
      !normalized ||
      normalized.startsWith('/') ||
      normalized.includes('..') ||
      path.isAbsolute(normalized)
    ) {
      throw new BadRequestException('小组件包包含非法路径');
    }
  }

  private async withPublicResponseFields(
    item: WidgetPublicResponse,
  ): Promise<WidgetPublicResponse> {
    const snapshot = this.isRecord(item.configSnapshot)
      ? item.configSnapshot
      : {};
    const entryFile = item.files?.find(
      (file) =>
        file.name === item.entryFileName && this.isNonEmptyString(file.url),
    );
    const fallbackEntryUrl =
      this.isNonEmptyString(item.dir) &&
      this.isNonEmptyString(item.entryFileName)
        ? `/uploads/${item.dir}/${item.entryFileName}`
        : undefined;
    const packageVersion = this.resolvePackageVersion(item, snapshot);
    const packageBaseKey = this.resolveSnapshotPackageBaseKey(item, snapshot);
    const snapshotEntryUrl =
      packageBaseKey && this.isNonEmptyString(snapshot.entry)
        ? `/static/${packageBaseKey}/${this.normalizeZipPath(snapshot.entry)}`
        : undefined;
    const snapshotIconUrl =
      packageBaseKey && this.isNonEmptyString(snapshot.icon)
        ? `/static/${packageBaseKey}/${this.normalizeZipPath(snapshot.icon)}`
        : undefined;
    const screenshots = item.screenshots?.length
      ? item.screenshots
      : await this.loadStoredPackageScreenshots(item);
    const appIcon =
      item.appIcon ??
      (this.isRecord(snapshot.appIcon)
        ? (snapshot.appIcon as WidgetAppIcon)
        : undefined);
    const iconUrl = snapshotIconUrl ?? item.iconUrl ?? item.icon?.url;
    const appIconUrl =
      item.appIconUrl ??
      (this.isNonEmptyString(snapshot.appIconUrl)
        ? snapshot.appIconUrl
        : undefined) ??
      (appIcon?.type === 'image' ? iconUrl : undefined);
    const pagePaths =
      item.pagePaths ??
      (this.isRecord(snapshot.pagePaths)
        ? (snapshot.pagePaths as WidgetPagePaths)
        : undefined);
    return {
      ...item,
      version: packageVersion ?? item.version,
      screenshots,
      entryUrl: snapshotEntryUrl ?? item.entryUrl ?? entryFile?.url ?? fallbackEntryUrl,
      iconUrl,
      appIcon,
      appIconUrl,
      pagePaths,
      configSnapshot: {
        ...(item.configSnapshot ?? {}),
        sizeConfigs: item.sizeConfigs,
        defaultSizeId: item.defaultSizeId,
        supportIconMode: item.supportIconMode,
        supportAppMode: item.supportAppMode,
        appIcon,
        appIconUrl,
        pagePaths,
        settingsSchema: item.settingsSchema,
        tags: item.tags,
        version: packageVersion ?? item.version,
        author: item.author,
        screenshots,
      },
    };
  }

  private async loadStoredPackageScreenshots(
    item: WidgetPublicResponse,
  ): Promise<WidgetScreenshot[]> {
    const baseKey = this.resolvePackageBaseKey(item);
    if (!baseKey) return [];

    let raw: unknown;
    try {
      const buffer = await fs.readFile(
        this.getLocalStoragePath(
          `${baseKey}/${WIDGET_SCREENSHOTS_MANIFEST_FILE}`,
        ),
      );
      raw = JSON.parse(buffer.toString('utf8'));
    } catch {
      return [];
    }

    if (!this.isRecord(raw) || !Array.isArray(raw.captures)) return [];
    return raw.captures
      .map((capture: WidgetScreenshotManifestCapture) =>
        this.normalizeStoredScreenshotCapture(capture, baseKey),
      )
      .filter((capture): capture is WidgetScreenshot => Boolean(capture));
  }

  private resolvePackageBaseKey(item: WidgetPublicResponse) {
    if (this.isNonEmptyString(item.entryUrl)) {
      const normalized = this.normalizeZipPath(item.entryUrl);
      if (normalized.startsWith('/static/widgets/')) {
        const withoutPrefix = normalized.replace(/^\/static\//, '');
        return path.dirname(withoutPrefix);
      }
    }

    const snapshot = this.isRecord(item.configSnapshot)
      ? item.configSnapshot
      : undefined;
    const sourceName = this.isNonEmptyString(item.packageSourceName)
      ? item.packageSourceName
      : this.isNonEmptyString(snapshot?.name)
        ? snapshot.name
        : undefined;
    const version = this.isNonEmptyString(item.version)
      ? item.version
      : this.isNonEmptyString(snapshot?.version)
        ? snapshot.version
        : undefined;

    return sourceName && version ? `widgets/${sourceName}/${version}` : undefined;
  }

  private resolveSnapshotPackageBaseKey(
    item: WidgetPublicResponse,
    snapshot: Record<string, unknown>,
  ) {
    const name = this.isNonEmptyString(snapshot.name)
      ? snapshot.name
      : item.packageSourceName;
    const version = this.resolvePackageVersion(item, snapshot);
    if (
      this.isNonEmptyString(name) &&
      this.isNonEmptyString(version)
    ) {
      return `widgets/${name}/${version}`;
    }
    return undefined;
  }

  private resolvePackageVersion(
    item: WidgetPublicResponse,
    snapshot: Record<string, unknown>,
  ) {
    const name = this.isNonEmptyString(snapshot.name)
      ? snapshot.name
      : item.packageSourceName;
    if (
      this.isNonEmptyString(name) &&
      this.isNonEmptyString(item.packageName)
    ) {
      const prefix = `${name}-`;
      if (item.packageName.startsWith(prefix) && item.packageName.endsWith(SNWIDGET_EXT)) {
        const version = item.packageName.slice(
          prefix.length,
          -SNWIDGET_EXT.length,
        );
        if (this.isNonEmptyString(version)) return version;
      }
    }

    return this.isNonEmptyString(snapshot.version)
      ? snapshot.version
      : item.version;
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private isPositiveInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  async toggleEnable(id: string, user?: string) {
    const doc = await this.widgetModel.findById(id).exec();
    if (!doc) throw new NotFoundException('小组件不存在');
    const next = !doc.enable;
    return this.widgetModel.findByIdAndUpdate(
      id,
      { enable: next, updater: user },
      { new: true },
    );
  }
}
