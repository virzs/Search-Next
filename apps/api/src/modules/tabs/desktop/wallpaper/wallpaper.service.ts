import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResourceService } from 'src/modules/resource/resource.service';
import { Response } from 'src/utils/response';
import {
  CreateWallpaperDto,
  WallpaperGroupQueryDto,
  UpdateWallpaperDto,
  WallpaperQueryDto,
} from './wallpaper.dto';
import { Wallpaper, WallpaperName } from './wallpaper.schema';
import {
  WallpaperCategory,
  WallpaperCategoryName,
} from '../wallpaper-category/wallpaper-category.schema';

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

  async getWallpapers(
    query: { page?: number; pageSize?: number } & WallpaperQueryDto,
  ) {
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
      this.ensureObjectId(categoryId, '壁纸分类不存在');
      finder.categoryId = categoryId;
    }

    const data = await this.wallpaperModel
      .find(finder)
      .populate('creator', 'username')
      .populate('updater', 'username')
      .populate('image', 'name url key mimetype size')
      .populate('thumbnail', 'name url key mimetype size image')
      .populate('categoryId', 'name isActive sortOrder')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const total = await this.wallpaperModel.countDocuments(finder);
    return Response.page(data, { page, pageSize, total });
  }

  async getActiveWallpapers(query: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
  }) {
    const { page = 1, pageSize = 10, categoryId } = query;
    const finder: any = { isActive: true };

    if (categoryId) {
      this.ensureObjectId(categoryId, '壁纸分类不存在');
      finder.categoryId = categoryId;
    }

    const data = await this.wallpaperModel
      .find(finder)
      .populate('image', 'name url key mimetype size')
      .populate('thumbnail', 'name url key mimetype size image')
      .populate('categoryId', 'name isActive sortOrder')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const total = await this.wallpaperModel.countDocuments(finder);
    return Response.page(data, { page, pageSize, total });
  }

  async getActiveWallpaperCategoryGroups(query: WallpaperGroupQueryDto) {
    const { page = 1, pageSize = 10, categoryId, groupSize = 8 } = query as any;

    if (categoryId) {
      this.ensureObjectId(categoryId, '壁纸分类不存在');
    }

    const usedCategoryIds = categoryId
      ? [new Types.ObjectId(categoryId)]
      : await this.wallpaperModel
          .distinct('categoryId', {
            isActive: true,
            categoryId: { $ne: null },
            isDelete: { $in: [false, null] },
          })
          .exec();

    const categoryFinder: any = { isActive: true };
    if (usedCategoryIds.length > 0) {
      categoryFinder._id = { $in: usedCategoryIds };
    } else {
      categoryFinder._id = { $in: [] };
    }

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
      throw new BadRequestException('壁纸分类不存在');
    }

    const groups = await Promise.all(
      categories.map(async (category) => {
        const finder: any = { isActive: true, categoryId: category._id };
        const [wallpapers, groupTotal] = await Promise.all([
          this.wallpaperModel
            .find(finder)
            .populate('image', 'name url key mimetype size')
            .populate('thumbnail', 'name url key mimetype size image')
            .sort({ sortOrder: 1, createdAt: -1 })
            .limit(Number(groupSize))
            .exec(),
          this.wallpaperModel.countDocuments(finder),
        ]);

        return {
          category,
          wallpapers,
          total: groupTotal,
        };
      }),
    );

    return Response.page(groups, { page, pageSize, total });
  }

  async createWallpaper(dto: CreateWallpaperDto, user?: string) {
    this.ensureObjectId(dto.image, '资源不存在');
    if (dto.categoryId) {
      this.ensureObjectId(dto.categoryId, '壁纸分类不存在');
    }

    const thumbnail = await this.createThumbnail(dto.image, user);
    const created = await this.wallpaperModel.create({
      ...dto,
      creator: user,
      thumbnail,
    });

    return this.wallpaperModel
      .findById(created._id)
      .populate('creator', 'username')
      .populate('image', 'name url key mimetype size')
      .populate('thumbnail', 'name url key mimetype size image')
      .populate('categoryId', 'name isActive sortOrder')
      .exec();
  }

  async updateWallpaper(id: string, dto: UpdateWallpaperDto, user?: string) {
    this.ensureObjectId(id, '壁纸不存在');

    if (dto.categoryId) {
      this.ensureObjectId(dto.categoryId, '壁纸分类不存在');
    }

    if (dto.image) {
      this.ensureObjectId(dto.image, '资源不存在');
    }

    const current = await this.wallpaperModel.findById(id).exec();
    if (!current) {
      throw new BadRequestException('壁纸不存在');
    }

    const updateDoc: any = { ...dto, updater: user };
    const imageChanged =
      typeof dto.image === 'string' && dto.image !== String(current.image);
    if (imageChanged) {
      if (current.thumbnail) {
        await this.resourceService.deleteFile(String(current.thumbnail));
      }
      updateDoc.thumbnail = await this.createThumbnail(dto.image, user);
    }

    const updated = await this.wallpaperModel
      .findByIdAndUpdate(id, updateDoc, { new: true })
      .populate('creator', 'username')
      .populate('updater', 'username')
      .populate('image', 'name url key mimetype size')
      .populate('thumbnail', 'name url key mimetype size image')
      .populate('categoryId', 'name isActive sortOrder');

    if (!updated) {
      throw new BadRequestException('壁纸不存在');
    }

    return updated;
  }

  async toggleWallpaper(id: string, user?: string) {
    this.ensureObjectId(id, '壁纸不存在');
    const current = await this.wallpaperModel.findById(id).exec();
    if (!current) {
      throw new BadRequestException('壁纸不存在');
    }

    const updated = await this.wallpaperModel
      .findByIdAndUpdate(
        id,
        { isActive: !current.isActive, updater: user },
        { new: true },
      )
      .populate('creator', 'username')
      .populate('updater', 'username')
      .populate('image', 'name url key mimetype size')
      .populate('thumbnail', 'name url key mimetype size image')
      .populate('categoryId', 'name isActive sortOrder');

    if (!updated) {
      throw new BadRequestException('壁纸不存在');
    }

    return updated;
  }

  async deleteWallpaper(id: string) {
    this.ensureObjectId(id, '壁纸不存在');
    const current = await this.wallpaperModel.findById(id).exec();

    if (!current) {
      throw new BadRequestException('壁纸不存在');
    }

    if (current.image) {
      await this.resourceService.deleteFile(String(current.image));
    }

    if (current.thumbnail) {
      await this.resourceService.deleteFile(String(current.thumbnail));
    }

    const result = await this.wallpaperModel.findByIdAndUpdate(id, {
      isDelete: true,
    });

    if (!result) {
      throw new BadRequestException('壁纸不存在');
    }

    return result;
  }

  async getWallpaperDetail(id: string) {
    this.ensureObjectId(id, '壁纸不存在');
    const wallpaper = await this.wallpaperModel
      .findById(id)
      .populate('creator', 'username')
      .populate('updater', 'username')
      .populate('image', 'name url key mimetype size')
      .populate('thumbnail', 'name url key mimetype size image')
      .populate('categoryId', 'name isActive sortOrder')
      .exec();

    if (!wallpaper) {
      throw new BadRequestException('壁纸不存在');
    }

    return wallpaper;
  }

  private async createThumbnail(resourceId: string, user?: string) {
    const created = await this.resourceService.processImageOne(
      resourceId,
      {
        variant: {
          outputName: 'thumbnail.webp',
          resize: { width: 480, withoutEnlargement: true },
          format: 'webp',
          quality: 80,
        },
      },
      user,
    );
    return created._id;
  }
}
