import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiPreset, AiPresetDocument, AiPresetName } from './preset.schema';
import { CreateAiPresetDto, UpdateAiPresetDto } from './dto/ai-preset.dto';

@Injectable()
export class AiPresetService {
  constructor(
    @InjectModel(AiPresetName)
    private readonly aiPresetModel: Model<AiPresetDocument>,
  ) {}

  async create(
    createAiPresetDto: CreateAiPresetDto,
    userId: string,
  ): Promise<AiPreset> {
    const createdPreset = new this.aiPresetModel({
      ...createAiPresetDto,
      creator: userId,
    });
    return createdPreset.save();
  }

  async findAll(query: any = {}): Promise<{ data: AiPreset[]; total: number }> {
    const { page = 1, pageSize = 10, ...filterQuery } = query;
    const filter: any = {};

    if (filterQuery.enabled !== undefined) {
      filter.enabled = filterQuery.enabled === 'true';
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const [data, total] = await Promise.all([
      this.aiPresetModel
        .find(filter)
        .sort({ createdAt: -1 })
        .populate('creator')
        .populate('updater')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.aiPresetModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<AiPreset> {
    const preset = await this.aiPresetModel.findById(id).exec();
    if (!preset) {
      throw new NotFoundException(`AI预设 ${id} 不存在`);
    }
    return preset;
  }

  async update(
    id: string,
    updateAiPresetDto: UpdateAiPresetDto,
    userId: string,
  ): Promise<AiPreset> {
    const updatedPreset = await this.aiPresetModel
      .findByIdAndUpdate(
        id,
        { ...updateAiPresetDto, updater: userId },
        { new: true },
      )
      .exec();

    if (!updatedPreset) {
      throw new NotFoundException(`AI预设 ${id} 不存在`);
    }

    return updatedPreset;
  }

  async remove(id: string): Promise<void> {
    const result = await this.aiPresetModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`AI预设 ${id} 不存在`);
    }
  }

  async toggleEnabled(id: string): Promise<AiPreset> {
    const preset = await this.aiPresetModel
      .findByIdAndUpdate(id, { $bit: { enabled: { xor: 1 } } }, { new: true })
      .exec();

    if (!preset) {
      throw new NotFoundException(`AI预设 ${id} 不存在`);
    }

    return preset;
  }

  async getEnabledPresets(): Promise<AiPreset[]> {
    return this.aiPresetModel.find({ enabled: true }).exec();
  }

  async getPresetByName(name: string): Promise<AiPreset | null> {
    return this.aiPresetModel.findOne({ name }).exec();
  }

  async findSimpleList(): Promise<{ _id: string; name: string }[]> {
    const result = await this.aiPresetModel
      .find({}, { _id: 1, name: 1, description: 1 })
      .sort({ createdAt: -1 })
      .exec();

    return result.map((item) => ({
      _id: item._id.toString(),
      name: item.name,
    }));
  }
}
