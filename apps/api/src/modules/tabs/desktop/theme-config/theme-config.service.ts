import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response } from 'src/utils/response';
import { ThemeConfig, ThemeConfigName } from './theme-config.schema';
import { CreateThemeConfigDto, UpdateThemeConfigDto } from './theme-config.dto';

@Injectable()
export class ThemeConfigService {
  constructor(
    @InjectModel(ThemeConfigName)
    private readonly themeConfigModel: Model<ThemeConfig>,
  ) {}

  private ensureObjectId(id: string, message: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }

  async getThemeConfigs(query: {
    page?: number;
    pageSize?: number;
    q?: string;
    isActive?: boolean;
    categoryId?: string;
  }) {
    const { page = 1, pageSize = 10, q, isActive, categoryId } = query;
    const finder: any = {};

    if (q) {
      finder.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (typeof isActive === 'boolean') {
      finder.isActive = isActive;
    }

    if (categoryId) {
      finder.categoryId = categoryId;
    }

    const data = await this.themeConfigModel
      .find(finder)
      .populate('creator', 'username')
      .populate('updater', 'username')
      .populate('previewImages', 'name url key mimetype size')
      .populate('categoryId', 'name isActive sortOrder')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    const total = await this.themeConfigModel.countDocuments(finder);

    return Response.page(data, { page, pageSize, total });
  }

  async getActiveThemeConfigs(query?: { categoryId?: string }) {
    const finder: any = { isActive: true };
    const categoryId = query?.categoryId;
    if (categoryId) {
      this.ensureObjectId(categoryId, '主题分类不存在');
      finder.categoryId = categoryId;
    }

    return this.themeConfigModel
      .find(finder)
      .populate('previewImages', 'name url key mimetype size')
      .populate('categoryId', 'name isActive sortOrder')
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async createThemeConfig(dto: CreateThemeConfigDto, user?: string) {
    const created = await this.themeConfigModel.create({
      ...dto,
      creator: user,
    });

    // 重新查询以获取populate的数据
    return this.themeConfigModel
      .findById(created._id)
      .populate('creator', 'username')
      .populate('previewImages', 'name url key mimetype size')
      .populate('categoryId', 'name isActive sortOrder')
      .exec();
  }

  async updateThemeConfig(
    id: string,
    dto: UpdateThemeConfigDto,
    user?: string,
  ) {
    this.ensureObjectId(id, '主题配置不存在');
    const updated = await this.themeConfigModel
      .findByIdAndUpdate(id, { ...dto, updater: user }, { new: true })
      .populate('creator', 'username')
      .populate('updater', 'username')
      .populate('previewImages', 'name url key mimetype size')
      .populate('categoryId', 'name isActive sortOrder');

    if (!updated) {
      throw new BadRequestException('主题配置不存在');
    }

    return updated;
  }

  async toggleThemeConfig(id: string, user?: string) {
    this.ensureObjectId(id, '主题配置不存在');
    // 先获取当前配置以判断启用状态
    const current = await this.themeConfigModel.findById(id).exec();
    if (!current) {
      throw new BadRequestException('主题配置不存在');
    }

    const updated = await this.themeConfigModel
      .findByIdAndUpdate(
        id,
        { isActive: !current.isActive, updater: user },
        { new: true },
      )
      .populate('creator', 'username')
      .populate('updater', 'username')
      .populate('previewImages', 'name url key mimetype size')
      .populate('categoryId', 'name isActive sortOrder');
    // 正常情况下 updated 一定存在，这里保留安全校验
    if (!updated) {
      throw new BadRequestException('主题配置不存在');
    }

    return updated;
  }

  async deleteThemeConfig(id: string) {
    this.ensureObjectId(id, '主题配置不存在');
    const result = await this.themeConfigModel.findByIdAndUpdate(id, {
      isDelete: true,
    });
    if (!result) {
      throw new BadRequestException('主题配置不存在');
    }
    return result;
  }

  async getThemeConfigDetail(id: string) {
    this.ensureObjectId(id, '主题配置不存在');
    const config = await this.themeConfigModel
      .findById(id)
      .populate('creator', 'username')
      .populate('updater', 'username')
      .populate('previewImages', 'name url key mimetype size')
      .populate('categoryId', 'name isActive sortOrder')
      .exec();

    if (!config) {
      throw new BadRequestException('主题配置不存在');
    }

    return config;
  }
}
