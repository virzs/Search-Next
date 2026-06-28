import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'src/utils/response';
import { AiModel, AiModelDocument, AiModelName } from './ai-model.schema';
import { CreateAiModelDto, UpdateAiModelDto } from './dto/ai-model.dto';
import { ProviderModel, ProviderModelDocument, ProviderModelName } from './provider-model.schema';

@Injectable()
export class AiModelService {
  constructor(
    @InjectModel(AiModelName)
    private aiModelModel: Model<AiModelDocument>,
    @InjectModel(ProviderModelName)
    private providerModel: Model<ProviderModelDocument>,
  ) {}

  async create(body: CreateAiModelDto, userId: string): Promise<any> {
    await this.normalizeDuplicatePublicModels();
    const publicName = this.getPublicName(body);
    const existing = await this.aiModelModel
      .findOne({ $or: [{ publicName }, { name: publicName }] })
      .exec();
    if (existing) {
      throw new BadRequestException('对外模型名已存在');
    }

    const model = await this.aiModelModel.create({
      enabled: true,
      ...body,
      name: publicName,
      publicName,
      creator: userId,
    });
    return this.detail(model._id.toString());
  }

  async update(id: string, body: UpdateAiModelDto, userId: string): Promise<any> {
    await this.normalizeDuplicatePublicModels();
    const model = await this.aiModelModel.findById(id).exec();
    if (!model) {
      throw new NotFoundException('模型不存在');
    }

    const publicName = this.getPublicName(body, model.publicName || model.name);
    if (publicName !== (model.publicName || model.name)) {
      const existing = await this.aiModelModel
        .findOne({ _id: { $ne: id }, $or: [{ publicName }, { name: publicName }] })
        .exec();
      if (existing) {
        throw new BadRequestException('对外模型名已存在');
      }
    }

    Object.assign(model, body, {
      name: publicName,
      publicName,
      updater: userId,
    });
    await model.save();

    return this.detail(id);
  }

  async page(query: any = {}): Promise<any> {
    await this.normalizeDuplicatePublicModels();
    const { page = 1, pageSize = 10, q, search, enabled } = query;
    const keyword = q || search;
    const filter: any = {};
    if (keyword) {
      filter.$or = [
        { publicName: { $regex: keyword, $options: 'i' } },
        { name: { $regex: keyword, $options: 'i' } },
        { displayName: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (enabled !== undefined && enabled !== '') {
      filter.enabled = String(enabled) === 'true';
    }

    const [models, total] = await Promise.all([
      this.aiModelModel
        .find(filter)
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .sort({ createdAt: -1 })
        .populate('creator')
        .populate('updater')
        .exec(),
      this.aiModelModel.countDocuments(filter).exec(),
    ]);

    const implementationCounts = await this.providerModel.aggregate([
      { $match: { publicModel: { $in: models.map((item) => item._id) }, isDelete: { $in: [false, null] } } },
      { $group: { _id: '$publicModel', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(implementationCounts.map((item) => [String(item._id), item.count]));
    const data = models.map((item) => ({
      ...this.normalizeModelJson(item),
      providerModelCount: countMap.get(String(item._id)) || 0,
    }));

    return Response.page(data, { page, pageSize, total });
  }

  async options(includeDisabled = false): Promise<any[]> {
    await this.normalizeDuplicatePublicModels();
    const models = await this.aiModelModel
      .find(
        includeDisabled ? {} : { enabled: true },
        {
          _id: 1,
          name: 1,
          publicName: 1,
          displayName: 1,
          contextWindow: 1,
          inputPricePer1K: 1,
          outputPricePer1K: 1,
          enabled: 1,
        },
      )
      .sort({ publicName: 1, name: 1 })
      .exec();
    return models.map((model) => this.normalizeModelJson(model));
  }

  async listEnabled(filter: any = {}): Promise<any[]> {
    await this.normalizeDuplicatePublicModels();
    const models = await this.aiModelModel
      .find({ ...filter, enabled: true })
      .sort({ publicName: 1, name: 1 })
      .exec();
    return models.map((model) => this.normalizeModelJson(model));
  }

  async detail(id: string): Promise<any> {
    const model = await this.aiModelModel
      .findById(id)
      .populate('creator')
      .populate('updater')
      .exec();
    if (!model) {
      throw new NotFoundException('模型不存在');
    }
    const providerModels = await this.listProviderModels(id);
    return {
      ...this.normalizeModelJson(model),
      providerModels,
    };
  }

  async listProviderModels(id: string): Promise<any[]> {
    return this.providerModel
      .find({ publicModel: id })
      .sort({ priority: -1, createdAt: 1 })
      .populate('provider', 'name displayName type enabled priority baseUrl')
      .exec();
  }

  async findEnabledByName(name: string): Promise<any> {
    await this.normalizeDuplicatePublicModels();
    const model = await this.aiModelModel
      .findOne({ enabled: true, $or: [{ publicName: name }, { name }] })
      .exec();
    return model ? this.normalizeModelJson(model) : null;
  }

  async getRunnableProviderModels(modelId: string): Promise<any[]> {
    return this.providerModel
      .find({ publicModel: modelId, enabled: true })
      .sort({ priority: -1, createdAt: 1 })
      .populate('provider')
      .exec();
  }

  async remove(id: string): Promise<any> {
    await this.aiModelModel.deleteOne({ _id: id }).exec();
    await this.providerModel.deleteMany({ publicModel: id }).exec();
    return { success: true };
  }

  async toggle(id: string, userId: string): Promise<any> {
    const model = await this.aiModelModel.findById(id).exec();
    if (!model) {
      throw new NotFoundException('模型不存在');
    }
    model.enabled = !model.enabled;
    model.updater = userId;
    const saved = await model.save();
    return this.normalizeModelJson(saved);
  }

  estimateCost(model: AiModel | any, usage?: any): number {
    if (!usage) {
      return 0;
    }
    const promptTokens = Number(usage.prompt_tokens || 0);
    const completionTokens = Number(usage.completion_tokens || 0);
    const inputCost = (promptTokens / 1000) * Number(model.inputPricePer1K || 0);
    const outputCost = (completionTokens / 1000) * Number(model.outputPricePer1K || 0);
    return Number((inputCost + outputCost).toFixed(8));
  }

  estimateUpstreamCost(providerModel: ProviderModel | any, usage?: any): number {
    if (!usage) {
      return 0;
    }
    const promptTokens = Number(usage.prompt_tokens || 0);
    const completionTokens = Number(usage.completion_tokens || 0);
    const inputCost = (promptTokens / 1000) * Number(providerModel.costInputPricePer1K || 0);
    const outputCost = (completionTokens / 1000) * Number(providerModel.costOutputPricePer1K || 0);
    return Number((inputCost + outputCost).toFixed(8));
  }

  private getPublicName(body: Partial<CreateAiModelDto>, fallback?: string): string {
    const publicName = body.publicName || fallback;
    if (!publicName) {
      throw new BadRequestException('对外模型名不能为空');
    }
    return publicName;
  }

  private normalizeModelJson(model: any) {
    const raw = typeof model.toJSON === 'function' ? model.toJSON() : model;
    const publicName = raw.publicName || raw.name;
    return {
      ...raw,
      publicName,
      name: publicName,
    };
  }

  private async normalizeDuplicatePublicModels() {
    const models = await this.aiModelModel.find().exec();
    const groups = new Map<string, AiModelDocument[]>();

    for (const model of models) {
      const publicName = model.publicName || model.name;
      if (!publicName) {
        continue;
      }
      const list = groups.get(publicName) || [];
      list.push(model);
      groups.set(publicName, list);
    }

    for (const [publicName, group] of groups) {
      if (group.length === 1) {
        const [model] = group;
        if (!model.publicName) {
          model.publicName = publicName;
          await model.save();
        }
        continue;
      }

      const canonical = this.pickCanonicalModel(group);
      const duplicates = group.filter((model) => String(model._id) !== String(canonical._id));

      for (const duplicate of duplicates) {
        const providerModels = await this.providerModel.find({ publicModel: duplicate._id }).exec();
        for (const implementation of providerModels) {
          const existing = await this.providerModel
            .findOne({
              _id: { $ne: implementation._id },
              publicModel: canonical._id,
              provider: implementation.provider,
              upstreamModel: implementation.upstreamModel,
            })
            .exec();

          if (existing) {
            await this.providerModel.deleteOne({ _id: implementation._id }).exec();
          } else {
            implementation.publicModel = canonical._id as any;
            await implementation.save();
          }
        }

        await this.aiModelModel.deleteOne({ _id: duplicate._id }).exec();
      }

      let changed = false;
      if (canonical.publicName !== publicName) {
        canonical.publicName = publicName;
        changed = true;
      }
      if (canonical.name !== publicName) {
        canonical.name = publicName;
        changed = true;
      }
      if (changed) {
        await canonical.save();
      }
    }
  }

  private pickCanonicalModel(models: AiModelDocument[]): AiModelDocument {
    return [...models].sort((a, b) => {
      const scoreDiff = this.getModelSourceScore(b) - this.getModelSourceScore(a);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return this.getModelTimestamp(b) - this.getModelTimestamp(a);
    })[0];
  }

  private getModelSourceScore(model: AiModelDocument): number {
    if (model.source === 'synced') {
      return 1;
    }
    return 2;
  }

  private getModelTimestamp(model: AiModelDocument): number {
    return new Date((model as any).updatedAt || (model as any).createdAt || 0).getTime();
  }
}
