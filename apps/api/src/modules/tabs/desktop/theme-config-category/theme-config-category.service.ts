import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response } from 'src/utils/response';
import {
  ThemeConfig,
  ThemeConfigName,
} from '../theme-config/theme-config.schema';
import {
  ThemeCategory,
  ThemeCategoryName,
} from './theme-config-category.schema';
import {
  CreateThemeCategoryDto,
  ThemeCategoryQueryDto,
  UpdateThemeCategoryDto,
} from './theme-config-category.dto';

@Injectable()
export class ThemeConfigCategoryService {
  constructor(
    @InjectModel(ThemeCategoryName)
    private readonly themeCategoryModel: Model<ThemeCategory>,
    @InjectModel(ThemeConfigName)
    private readonly themeConfigModel: Model<ThemeConfig>,
  ) {}

  private ensureObjectId(id: string, message: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }

  async getThemeCategories(
    query: ThemeCategoryQueryDto & {
      page?: number;
      pageSize?: number;
    },
  ) {
    const { page = 1, pageSize = 10, q, isActive } = query;
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

    const data = await this.themeCategoryModel
      .find(finder)
      .populate('creator', 'username')
      .populate('updater', 'username')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    const total = await this.themeCategoryModel.countDocuments(finder);

    return Response.page(data, { page, pageSize, total });
  }

  async getUserThemeCategories() {
    const categoryIds = await this.themeConfigModel.distinct('categoryId', {
      isActive: true,
      categoryId: { $ne: null },
    });

    if (!categoryIds.length) return [];

    return this.themeCategoryModel
      .find({ _id: { $in: categoryIds }, isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async createThemeCategory(dto: CreateThemeCategoryDto, user?: string) {
    const created = await this.themeCategoryModel.create({
      ...dto,
      creator: user,
    });

    return this.themeCategoryModel
      .findById(created._id)
      .populate('creator', 'username')
      .exec();
  }

  async updateThemeCategory(
    id: string,
    dto: UpdateThemeCategoryDto,
    user?: string,
  ) {
    this.ensureObjectId(id, '主题分类不存在');
    const updated = await this.themeCategoryModel
      .findByIdAndUpdate(id, { ...dto, updater: user }, { new: true })
      .populate('creator', 'username')
      .populate('updater', 'username');

    if (!updated) {
      throw new BadRequestException('主题分类不存在');
    }

    return updated;
  }

  async toggleThemeCategory(id: string, user?: string) {
    this.ensureObjectId(id, '主题分类不存在');
    const current = await this.themeCategoryModel.findById(id).exec();
    if (!current) {
      throw new BadRequestException('主题分类不存在');
    }

    const updated = await this.themeCategoryModel
      .findByIdAndUpdate(
        id,
        { isActive: !current.isActive, updater: user },
        { new: true },
      )
      .populate('creator', 'username')
      .populate('updater', 'username');

    if (!updated) {
      throw new BadRequestException('主题分类不存在');
    }

    return updated;
  }

  async deleteThemeCategory(id: string) {
    this.ensureObjectId(id, '主题分类不存在');
    const result = await this.themeCategoryModel.findByIdAndUpdate(id, {
      isDelete: true,
    });
    if (!result) {
      throw new BadRequestException('主题分类不存在');
    }
    return result;
  }

  async getThemeCategoryDetail(id: string) {
    this.ensureObjectId(id, '主题分类不存在');
    const category = await this.themeCategoryModel
      .findById(id)
      .populate('creator', 'username')
      .populate('updater', 'username')
      .exec();

    if (!category) {
      throw new BadRequestException('主题分类不存在');
    }

    return category;
  }
}
