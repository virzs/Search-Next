import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebsiteName, WebsiteTagName } from './schemas/ref-names';
import { Model } from 'mongoose';
import { Website } from './schemas/website';
import { WebsiteTag } from './schemas/tag';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { PageDto } from 'src/public/dto/page';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import {
  ParseWebsiteDto,
  UpdateWebsitePublicDto,
  WebsiteDto,
  WebsiteForAdminDto,
  WebsitesForUserDto,
  WebsitesPublicDto,
} from './dto/website';
import { ClassifyService } from './classify/classify.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Response } from 'src/utils/response';

type WebsiteExportItem = {
  name: string;
  url: string;
  description?: string;
  enable?: boolean;
  public?: boolean;
  themeColor?: string;
};

type ImportErrorItem = {
  index: number;
  key?: string;
  message: string;
};

type ImportResult = {
  total: number;
  created: number;
  updated: number;
  restored: number;
  failed: number;
  errors: ImportErrorItem[];
};

@Injectable()
export class WebsiteService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(WebsiteName) private websiteModel: Model<Website>,
    @InjectModel(WebsiteTagName) private tagModel: Model<WebsiteTag>,
    private readonly classifyService: ClassifyService,
  ) {}

  /**
   * 获取网站分页 后台
   */
  async getWebsites(query: WebsiteForAdminDto) {
    const { page = 1, pageSize = 10, classifyIds, search, enable } = query;
    const classifyIdsArr = ![null, undefined, ''].includes(classifyIds)
      ? classifyIds.split(',')
      : [];

    // 构建查询条件
    const finder: any = {};

    // 处理分类筛选
    if (classifyIdsArr.length > 0) {
      finder['classify'] = { $in: classifyIdsArr };
    }
    if (search) {
      finder.$or = [
        { name: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }
    if (typeof enable === 'boolean') {
      finder.enable = enable;
    }

    const websites = await this.websiteModel
      .find(finder)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('classify')
      .populate('tags', 'id name')
      .exec();

    const total = await this.websiteModel.countDocuments(finder);

    return Response.page(websites, { page, pageSize, total });
  }

  /**
   * 获取网站分页 用户
   */
  async getWebsitesForUser(query: WebsitesForUserDto) {
    const { page = 1, pageSize = 10, tags, classify, search } = query;
    const finder: any = {
      enable: true,
      public: true,
    };

    if (tags) finder.tags = { $all: tags };
    if (classify) {
      const ids = await this.classifyService.getSelfAndChildrenIds(classify);
      finder.classify = { $in: ids };
    }
    if (search) {
      finder.$or = [
        { name: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }

    const websites = await this.websiteModel
      .find(finder)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('tags', 'id name')
      .exec();

    const total = await this.websiteModel.countDocuments(finder);

    return Response.page(websites, { page, pageSize, total });
  }

  /**
   * 公开网站分页（精简字段）
   */
  async getPublicWebsitesLite(query: WebsitesPublicDto) {
    const { page = 1, pageSize = 10, tags, classify, search } = query as any;
    const finder: any = {
      enable: true,
      public: true,
    };

    if (tags) finder.tags = { $all: tags };
    if (classify) {
      const ids = await this.classifyService.getSelfAndChildrenIds(classify);
      finder.classify = { $in: ids };
    }
    if (search) {
      finder.$or = [
        { name: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }

    const data = await this.websiteModel
      .find(finder)
      .select('name url icon iconEdited themeColor description click')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const total = await this.websiteModel.countDocuments(finder);

    return Response.page(data, { page, pageSize, total });
  }

  /**
   * 我创建的网站分页
   */
  async getMyWebsites(query: PageDto, user: string) {
    const { page = 1, pageSize = 10 } = query;

    const finder = { creator: user };

    const users = await this.websiteModel
      .find(finder)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('tags', 'id name')
      .exec();

    const total = await this.websiteModel.countDocuments(finder);

    return { data: users, page, pageSize, total };
  }

  async exportAll() {
    const rows = await this.websiteModel
      .find({})
      .select('-_id name url description enable public themeColor')
      .lean()
      .exec();

    return {
      schemaVersion: 1,
      type: 'website',
      exportedAt: new Date().toISOString(),
      items: rows.map((row) => this.toExportItem(row)),
    };
  }

  async importAll(payload: unknown, user?: string): Promise<ImportResult> {
    const items = this.getImportItems(payload, 'website');
    const result: ImportResult = {
      total: items.length,
      created: 0,
      updated: 0,
      restored: 0,
      failed: 0,
      errors: [],
    };

    for (const [index, raw] of items.entries()) {
      const rowNumber = index + 1;
      const key = this.getImportKey(raw, 'url');

      try {
        const normalizedRaw = this.normalizeWebsiteImportItem(raw);
        const validation = await this.validateDto(WebsiteDto, normalizedRaw);
        if (!validation.data) {
          this.pushImportError(result, rowNumber, key, validation.message);
          continue;
        }

        const data = this.toWebsiteImportData(validation.data);
        const existing = await this.websiteModel
          .findOne({ url: data.url })
          .exec();

        if (existing) {
          await this.websiteModel
            .findByIdAndUpdate(
              existing._id,
              {
                ...data,
                updater: user,
              },
              { new: true },
            )
            .exec();
          result.updated += 1;
          continue;
        }

        await this.websiteModel.create({
          ...data,
          creator: user,
        });
        result.created += 1;
      } catch (error) {
        this.pushImportError(result, rowNumber, key, this.errorMessage(error));
      }
    }

    result.failed = result.errors.length;
    return result;
  }

  /**
   * 新增网站
   */
  async addWebsite(data: WebsiteDto, user: string) {
    const website = await this.websiteModel.create({
      ...data,
      creator: user,
    });
    if (data.classify) {
      await this.classifyService.toggleWebsite(
        data.classify,
        String(website._id),
      );
    }
    // 处理标签关联
    if (data.tags && data.tags.length > 0) {
      await this.updateWebsiteTags(String(website._id), data.tags, 'add');
    }
    return website;
  }

  /**
   * 更新网站
   */
  async updateWebsite(id: string, data: WebsiteDto, user: string) {
    // 先获取当前网站的信息，以便检查分类和标签是否有变化
    const currentWebsite = await this.websiteModel
      .findById(id)
      .populate('tags');
    if (!currentWebsite) {
      throw new Error('网站不存在');
    }

    // 获取当前网站的分类ID（如果有）
    const oldClassifyId = currentWebsite.classify
      ? (currentWebsite.classify as unknown as string)
      : null;

    // 获取新的分类ID（如果有）
    const newClassifyId = data.classify || null;

    // 获取当前网站的标签ID列表
    const oldTagIds = currentWebsite.tags
      ? currentWebsite.tags.map((tag: any) => tag._id.toString())
      : [];
    const newTagIds = data.tags || [];

    // 更新网站信息
    const result = await this.websiteModel.findByIdAndUpdate(id, {
      ...data,
      updater: user,
    });

    // 处理分类变更
    if (oldClassifyId !== newClassifyId) {
      // 如果旧分类存在，需要从旧分类中移除网站
      if (oldClassifyId) {
        await this.classifyService.toggleWebsite(oldClassifyId, id);
      }

      // 如果新分类存在，需要将网站添加到新分类
      if (newClassifyId) {
        await this.classifyService.toggleWebsite(newClassifyId, id);
      }
    }

    // 处理标签变更
    const tagsToRemove = oldTagIds.filter(
      (tagId) => !newTagIds.includes(tagId),
    );
    const tagsToAdd = newTagIds.filter((tagId) => !oldTagIds.includes(tagId));

    // 移除不再关联的标签
    if (tagsToRemove.length > 0) {
      await this.updateWebsiteTags(id, tagsToRemove, 'remove');
    }

    // 添加新关联的标签
    if (tagsToAdd.length > 0) {
      await this.updateWebsiteTags(id, tagsToAdd, 'add');
    }

    return result;
  }

  /**
   * 修改是否公开 可批量
   */
  async updateWebsitePublic(body: UpdateWebsitePublicDto) {
    const { ids, isPublic } = body;

    console.log(ids, isPublic, 'xxxxxxxxxx');

    const result = await this.websiteModel.updateMany(
      { _id: { $in: ids } },
      { public: isPublic },
    );

    if (result) {
      return result;
    } else {
      throw new Error('修改失败');
    }
  }

  /**
   * 删除网站
   */
  async deleteWebsite(id: string) {
    // 获取网站信息以处理关联关系
    const website = await this.websiteModel.findById(id).populate('tags');
    if (!website) {
      throw new Error('网站不存在');
    }

    // 软删除网站
    const result = await this.websiteModel.findByIdAndUpdate(id, {
      isDelete: true,
    });

    // 处理分类关联
    if (result.classify) {
      await this.classifyService.toggleWebsite(
        result.classify as unknown as string,
        id,
      );
    }

    // 处理标签关联 - 从所有关联的标签中移除此网站
    if (website.tags && website.tags.length > 0) {
      const tagIds = website.tags.map((tag: any) => tag._id.toString());
      await this.updateWebsiteTags(id, tagIds, 'remove');
    }

    return result;
  }

  /**
   * 详情
   */
  async detail(id: string) {
    return this.websiteModel
      .findById(id)
      .populate('classify')
      .populate('tags', 'id name')
      .exec();
  }

  /**
   * 根据url解析网站meta信息
   */
  async parseWebsiteMeta({ url, ignoreCache }: ParseWebsiteDto) {
    if (!ignoreCache) {
      const cacheResult: object = await this.cacheManager.get(
        `website:meta:${url}`,
      );
      if (cacheResult) return { ...cacheResult, isCache: true };
    }

    const result = await axios
      .get(url)
      .then((response) => {
        const $ = cheerio.load(response.data);
        const title = $('title').text();
        const description = $('meta[name="description"]').attr('content');

        // 收集所有可能的图标
        const icons = [
          $('link[rel="icon"]').attr('href'),
          $('link[rel="shortcut icon"]').attr('href'),
          $('link[rel="apple-touch-icon"]').attr('href'),
          $('link[rel="apple-touch-icon-precomposed"]').attr('href'),
        ].filter(Boolean);

        // 使用第一个有效的图标
        const icon = icons.length > 0 ? icons[0] : null;

        return { title, description, icon, icons };
      })
      .catch(() => {
        return {};
      });

    if (Object.keys(result).length !== 0) {
      await this.cacheManager.set(
        `website:meta:${url}`,
        result,
        24 * 60 * 60 * 1000,
      );
    }
    return result;
  }

  /**
   * 缓存点击数
   * @param id
   */
  async incrementClick(id: string): Promise<void> {
    const cacheKey = `website:${id}:click`;
    const currentClicks = (await this.cacheManager.get<number>(cacheKey)) || 0;
    await this.cacheManager.set(cacheKey, currentClicks + 1, 2 * 60 * 1000);

    // 维护一个索引，避免对 Redis 进行 keys/scan，降低误用命令带来的语法错误风险
    const indexKey = 'website:click:index';
    const index = (await this.cacheManager.get<string[]>(indexKey)) || [];
    if (!index.includes(cacheKey)) {
      index.push(cacheKey);
      // 索引与点击 key 同步 TTL，确保定时任务周期内可见
      await this.cacheManager.set(indexKey, index, 2 * 60 * 1000);
    }
  }

  /**
   * 同步点击数
   */
  @Cron('0 * * * * *') // 每分钟同步一次点击数
  async syncClicks(): Promise<void> {
    const indexKey = 'website:click:index';
    const keys = (await this.cacheManager.get<string[]>(indexKey)) || [];
    if (!Array.isArray(keys) || keys.length === 0) return;

    // 去重
    const uniqueKeys = Array.from(new Set(keys));

    for (const key of uniqueKeys) {
      if (typeof key !== 'string') continue;
      const id = key.split(':')[1];
      const clicks = await this.cacheManager.get<number>(key);
      if (clicks !== undefined) {
        await this.websiteModel.findByIdAndUpdate(id, { click: clicks });
        await this.cacheManager.del(key);
      }
    }

    // 清理索引，新的点击会再次写入索引
    await this.cacheManager.del(indexKey);
  }

  /**
   * 获取前50点击量的记录
   */
  async getTop50Clicks() {
    return this.websiteModel.find().sort({ click: -1 }).limit(50).exec();
  }

  /**
   * 每小时更新一次前50点击量排行
   */
  @Cron('0 0 * * * *') // 每小时执行一次
  async updateTop50Clicks() {
    const top50Clicks = await this.getTop50Clicks();
    await this.cacheManager.set('top50Clicks', top50Clicks, 2 * 60 * 60 * 1000);
    return top50Clicks;
  }

  /**
   * 从缓存中获取前50点击量的记录
   */
  async getTop50ClicksFromCache() {
    const top = await this.cacheManager.get<Website[]>('top50Clicks');
    if (top) return top;
    // 缓存中没有则更新一次
    return await this.updateTop50Clicks();
  }

  /**
   * 私有方法：更新网站的标签关联
   * @param websiteId 网站ID
   * @param tagIds 标签ID数组
   * @param action 操作类型：add-添加关联，remove-移除关联
   */
  private async updateWebsiteTags(
    websiteId: string,
    tagIds: string[],
    action: 'add' | 'remove',
  ) {
    // 根据操作类型确定更新操作
    const websiteUpdateOperation =
      action === 'add'
        ? { $addToSet: { tags: { $each: tagIds } } }
        : { $pull: { tags: { $in: tagIds } } };

    // 更新网站的标签字段
    await this.websiteModel.findByIdAndUpdate(
      websiteId,
      websiteUpdateOperation,
    );

    // 同时更新标签的网站字段
    const tagUpdateOperation =
      action === 'add'
        ? { $addToSet: { websites: websiteId } }
        : { $pull: { websites: websiteId } };

    // 批量更新所有相关标签
    await this.tagModel.updateMany(
      { _id: { $in: tagIds } },
      tagUpdateOperation,
    );
  }

  private getImportItems(payload: unknown, expectedType: string) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('导入文件格式不正确');
    }

    const body = payload as { type?: unknown; items?: unknown };
    if (body.type !== undefined && body.type !== expectedType) {
      throw new BadRequestException('导入文件类型不匹配');
    }
    if (!Array.isArray(body.items)) {
      throw new BadRequestException('导入文件缺少 items 数组');
    }
    return body.items;
  }

  private normalizeWebsiteImportItem(raw: unknown) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
    const item = raw as Record<string, unknown>;
    return {
      name: this.trimString(item.name),
      url: this.trimString(item.url),
      description: this.trimString(item.description),
      enable: item.enable,
      public: item.public,
      themeColor: this.normalizeRgbColor(item.themeColor),
    };
  }

  private toWebsiteImportData(data: WebsiteDto): WebsiteExportItem {
    const item: WebsiteExportItem = {
      name: data.name,
      url: data.url,
    };
    if (data.description !== undefined) item.description = data.description;
    if (data.enable !== undefined) item.enable = data.enable;
    if (data.public !== undefined) item.public = data.public;
    if (data.themeColor !== undefined) item.themeColor = data.themeColor;
    return item;
  }

  private async validateDto<T extends object>(
    dtoClass: new () => T,
    raw: unknown,
  ): Promise<{ data?: T; message?: string }> {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { message: '导入项必须是对象' };
    }

    const object = plainToInstance(dtoClass, raw, {
      excludeExtraneousValues: true,
    });
    const plain = instanceToPlain(object) as Record<string, unknown>;
    for (const key of Object.keys(plain)) {
      if (plain[key] === undefined) {
        delete plain[key];
      }
    }

    const errors = await validate(plainToInstance(dtoClass, plain));
    if (errors.length > 0) {
      return { message: this.getFirstValidationMessage(errors) };
    }

    return { data: plain as T };
  }

  private toExportItem(row: any): WebsiteExportItem {
    return {
      name: row.name,
      url: row.url,
      description: row.description,
      enable: row.enable,
      public: row.public,
      themeColor: row.themeColor,
    };
  }

  private pushImportError(
    result: ImportResult,
    index: number,
    key: string | undefined,
    message = '导入失败',
  ) {
    result.errors.push({ index, key, message });
  }

  private getImportKey(raw: unknown, key: string) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
    const value = (raw as Record<string, unknown>)[key];
    return typeof value === 'string' ? value.trim() : undefined;
  }

  private trimString(value: unknown) {
    return typeof value === 'string' ? value.trim() : value;
  }

  private optionalString(value: unknown) {
    const trimmed = this.trimString(value);
    return trimmed === '' ? undefined : trimmed;
  }

  private normalizeRgbColor(value: unknown) {
    const trimmed = this.optionalString(value);
    if (typeof trimmed !== 'string') return trimmed;
    return /^rgba?\(/i.test(trimmed) ? trimmed.replace(/\s+/g, '') : trimmed;
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error || '导入失败');
  }

  private getFirstValidationMessage(errors: ValidationError[]): string {
    for (const error of errors) {
      if (error.constraints) {
        return Object.values(error.constraints)[0];
      }
      if (error.children?.length) {
        return this.getFirstValidationMessage(error.children);
      }
    }
    return '参数校验失败';
  }
}
