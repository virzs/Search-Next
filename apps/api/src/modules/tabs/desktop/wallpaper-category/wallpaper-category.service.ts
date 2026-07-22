import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Response } from "src/utils/response";
import { Wallpaper, WallpaperName } from "../wallpaper/wallpaper.schema";
import {
  WallpaperCategory,
  WallpaperCategoryName,
} from "./wallpaper-category.schema";
import {
  CreateWallpaperCategoryDto,
  UpdateWallpaperCategoryDto,
  WallpaperCategoryQueryDto,
} from "./wallpaper-category.dto";

@Injectable()
export class WallpaperCategoryService {
  constructor(
    @InjectModel(WallpaperCategoryName)
    private readonly wallpaperCategoryModel: Model<WallpaperCategory>,
    @InjectModel(WallpaperName)
    private readonly wallpaperModel: Model<Wallpaper>,
  ) {}

  private ensureObjectId(id: string, message: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(message);
    }
  }

  async getWallpaperCategories(
    query: { page?: number; pageSize?: number } & WallpaperCategoryQueryDto,
  ) {
    const { page = 1, pageSize = 10, q, isActive } = query;
    const finder: any = {};

    if (q) {
      finder.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (typeof isActive === "boolean") {
      finder.isActive = isActive;
    }

    const data = await this.wallpaperCategoryModel
      .find(finder)
      .populate("creator", "username")
      .populate("updater", "username")
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const total = await this.wallpaperCategoryModel.countDocuments(finder);
    return Response.page(data, { page, pageSize, total });
  }

  async getUserWallpaperCategories(
    type?: "image" | "gradient" | "application",
  ) {
    if (type && !["image", "gradient", "application"].includes(type)) {
      throw new BadRequestException("壁纸类型不正确");
    }
    const finder: any = { isActive: true };
    if (type === "application") finder.type = "application";
    if (type === "gradient") finder.type = "gradient";
    if (type === "image") {
      finder.$or = [{ type: "image" }, { type: { $exists: false } }];
    }
    const usedCategoryIds = await this.wallpaperModel
      .distinct("categoryId", finder)
      .exec();

    return this.wallpaperCategoryModel
      .find({ isActive: true, _id: { $in: usedCategoryIds } })
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async getAdminEnabledWallpaperCategories() {
    return this.wallpaperCategoryModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async createWallpaperCategory(
    dto: CreateWallpaperCategoryDto,
    user?: string,
  ) {
    const created = await this.wallpaperCategoryModel.create({
      ...dto,
      creator: user,
    });

    return this.wallpaperCategoryModel
      .findById(created._id)
      .populate("creator", "username")
      .exec();
  }

  async updateWallpaperCategory(
    id: string,
    dto: UpdateWallpaperCategoryDto,
    user?: string,
  ) {
    this.ensureObjectId(id, "壁纸分类不存在");
    const updated = await this.wallpaperCategoryModel
      .findByIdAndUpdate(id, { ...dto, updater: user }, { new: true })
      .populate("creator", "username")
      .populate("updater", "username");

    if (!updated) {
      throw new BadRequestException("壁纸分类不存在");
    }

    return updated;
  }

  async toggleWallpaperCategory(id: string, user?: string) {
    this.ensureObjectId(id, "壁纸分类不存在");
    const current = await this.wallpaperCategoryModel.findById(id).exec();
    if (!current) {
      throw new BadRequestException("壁纸分类不存在");
    }

    const updated = await this.wallpaperCategoryModel
      .findByIdAndUpdate(
        id,
        { isActive: !current.isActive, updater: user },
        { new: true },
      )
      .populate("creator", "username")
      .populate("updater", "username");

    if (!updated) {
      throw new BadRequestException("壁纸分类不存在");
    }

    return updated;
  }

  async deleteWallpaperCategory(id: string) {
    this.ensureObjectId(id, "壁纸分类不存在");
    const result = await this.wallpaperCategoryModel.findByIdAndUpdate(id, {
      isDelete: true,
    });

    if (!result) {
      throw new BadRequestException("壁纸分类不存在");
    }

    return result;
  }

  async getWallpaperCategoryDetail(id: string) {
    this.ensureObjectId(id, "壁纸分类不存在");
    const category = await this.wallpaperCategoryModel
      .findById(id)
      .populate("creator", "username")
      .populate("updater", "username")
      .exec();

    if (!category) {
      throw new BadRequestException("壁纸分类不存在");
    }

    return category;
  }
}
