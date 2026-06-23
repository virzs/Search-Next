import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'src/utils/response';
import { SearchEngine, SearchEngineName } from './schemas/search-engine.schema';
import {
  CreateSearchEngineDto,
  UpdateSearchEngineDto,
} from './dto/search-engine.dto';

@Injectable()
export class SearchEngineService {
  constructor(
    @InjectModel(SearchEngineName)
    private readonly searchEngineModel: Model<SearchEngine>,
  ) {}

  async page(query: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = query;
    const finder = {};

    const data = await this.searchEngineModel
      .find(finder)
      .populate('creator', 'username')
      .populate('updater', 'username')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    const total = await this.searchEngineModel.countDocuments(finder);

    return Response.page(data, { page, pageSize, total });
  }

  async listEnabled() {
    return this.searchEngineModel.find({ isEnabled: true }).exec();
  }

  async create(dto: CreateSearchEngineDto, user?: string) {
    const created = await this.searchEngineModel.create({
      ...dto,
      creator: user,
    });
    return created;
  }

  async update(id: string, dto: UpdateSearchEngineDto, user?: string) {
    const updated = await this.searchEngineModel.findByIdAndUpdate(
      id,
      { ...dto, updater: user },
      { new: true },
    );
    return updated;
  }

  async setEnable(id: string, isEnabled: boolean, user?: string) {
    return this.searchEngineModel.findByIdAndUpdate(
      id,
      { isEnabled, updater: user },
      { new: true },
    );
  }

  async toggleEnable(id: string, user?: string) {
    const doc = await this.searchEngineModel.findById(id).exec();
    if (!doc) return null;
    const next = !doc.isEnabled;
    return this.searchEngineModel.findByIdAndUpdate(
      id,
      { isEnabled: next, updater: user },
      { new: true },
    );
  }

  async delete(id: string) {
    return this.searchEngineModel.findByIdAndUpdate(id, { isDelete: true });
  }

  async detail(id: string) {
    return this.searchEngineModel.findById(id).exec();
  }
}
