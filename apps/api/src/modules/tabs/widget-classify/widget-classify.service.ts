import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'src/utils/response';
import {
  WidgetClassify,
  WidgetClassifyName,
} from './schemas/widget-classify.schema';
import {
  WidgetClassifyDto,
  WidgetClassifyQueryDto,
} from './dto/widget-classify.dto';

@Injectable()
export class WidgetClassifyService {
  constructor(
    @InjectModel(WidgetClassifyName)
    private readonly classifyModel: Model<WidgetClassify>,
  ) {}

  async list(query: WidgetClassifyQueryDto) {
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

  async create(dto: WidgetClassifyDto, user?: string) {
    const created = await this.classifyModel.create({ ...dto, creator: user });
    return created;
  }

  async update(id: string, dto: Partial<WidgetClassifyDto>, user?: string) {
    const updated = await this.classifyModel.findByIdAndUpdate(
      id,
      { ...dto, updater: user },
      { new: true },
    );
    if (!updated) throw new NotFoundException('小组件分类不存在');
    return updated;
  }

  async detail(id: string) {
    const item = await this.classifyModel.findById(id).exec();
    if (!item) throw new NotFoundException('小组件分类不存在');
    return item;
  }

  async delete(id: string) {
    const res = await this.classifyModel.findByIdAndUpdate(id, {
      isDelete: true,
    });
    if (!res) throw new NotFoundException('小组件分类不存在');
    return res;
  }

  async toggleEnable(id: string, user?: string) {
    const doc = await this.classifyModel.findById(id).exec();
    if (!doc) throw new NotFoundException('小组件分类不存在');
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
}
