import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'src/utils/response';
import {
  AppClassify,
  AppClassifyName,
} from './schemas/app-classify.schema';
import {
  AppClassifyDto,
  AppClassifyQueryDto,
} from './dto/app-classify.dto';
import { App, AppName } from '../app/schemas/app.schema';

@Injectable()
export class AppClassifyService {
  constructor(
    @InjectModel(AppClassifyName)
    private readonly classifyModel: Model<AppClassify>,
    @InjectModel(AppName)
    private readonly appModel: Model<App>,
  ) {}

  async list(query: AppClassifyQueryDto) {
    const { page = 1, pageSize = 10, search } = query as any;
    const conditions: any = {};
    if (search) conditions.name = { $regex: search, $options: 'i' };

    const list = await this.classifyModel
      .find(conditions)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();

    const total = await this.classifyModel.countDocuments(conditions);
    return Response.page(list, { page, pageSize, total });
  }

  async create(dto: AppClassifyDto, user?: string) {
    const created = await this.classifyModel.create({ ...dto, creator: user });
    return created;
  }

  async update(id: string, dto: Partial<AppClassifyDto>, user?: string) {
    const updated = await this.classifyModel.findByIdAndUpdate(
      id,
      { ...dto, updater: user },
      { new: true },
    );
    if (!updated) throw new NotFoundException('应用分类不存在');
    return updated;
  }

  async detail(id: string) {
    const item = await this.classifyModel.findById(id).exec();
    if (!item) throw new NotFoundException('应用分类不存在');
    return item;
  }

  async delete(id: string) {
    const res = await this.classifyModel.findByIdAndUpdate(id, {
      isDelete: true,
    });
    if (!res) throw new NotFoundException('应用分类不存在');
    return res;
  }

  async toggleEnable(id: string, user?: string) {
    const doc = await this.classifyModel.findById(id).exec();
    if (!doc) throw new NotFoundException('应用分类不存在');
    const next = !doc.enable;
    return this.classifyModel.findByIdAndUpdate(
      id,
      { enable: next, updater: user },
      { new: true },
    );
  }

  async listEnabled() {
    return this.classifyModel
      .find({ enable: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async listPublicLevel1() {
    const classifies = await this.classifyModel
      .find({ enable: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .exec();

    if (!classifies.length) return [];

    const counts = await this.appModel
      .aggregate([
        {
          $match: {
            enable: true,
            classify: { $in: classifies.map((item: any) => item._id) },
          },
        },
        { $group: { _id: '$classify', count: { $sum: 1 } } },
      ])
      .exec();

    const countByClassify = new Map<string, number>();
    for (const row of counts as any[]) {
      countByClassify.set(String(row._id), Number(row.count ?? 0));
    }

    return (classifies as any[])
      .map((item) => ({
        ...item,
        appCount: countByClassify.get(String(item._id)) ?? 0,
      }))
      .filter((item) => item.appCount > 0);
  }
}
