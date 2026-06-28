import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import OpenAI from 'openai';
import { AiModel, AiModelDocument, AiModelName } from '../models/ai-model.schema';
import { ProviderModel, ProviderModelDocument, ProviderModelName } from '../models/provider-model.schema';
import { AiSecretService } from '../secret/ai-secret.service';
import { Response } from 'src/utils/response';
import { AiProvider, AiProviderDocument, AiProviderName } from './provider.schema';
import { ProviderModelDto, UpdateProviderModelDto } from './dto/provider.dto';

@Injectable()
export class ProviderService {
  constructor(
    @InjectModel(AiProviderName)
    private aiProviderModel: Model<AiProviderDocument>,
    @InjectModel(AiModelName)
    private aiModelModel: Model<AiModelDocument>,
    @InjectModel(ProviderModelName)
    private providerModel: Model<ProviderModelDocument>,
    private secretService: AiSecretService,
  ) {}

  private sanitizeProvider(provider: any, options?: { includeApiKey?: boolean }) {
    if (!provider) {
      return provider;
    }

    const raw = typeof provider.toJSON === 'function' ? provider.toJSON() : provider;
    const { encryptedApiKey, ...safe } = raw;
    if (options?.includeApiKey) {
      safe.apiKey = this.getApiKey(raw);
    }
    return safe;
  }

  private buildProviderPayload(providerData: Partial<AiProvider> & { apiKey?: string }) {
    const { apiKey, ...payload } = providerData as any;
    const data: any = { ...payload };
    if (apiKey) {
      const normalizedApiKey = this.normalizeApiKey(apiKey);
      data.encryptedApiKey = this.secretService.encrypt(normalizedApiKey);
      data.apiKeyPreview = this.secretService.preview(normalizedApiKey);
    }
    return data;
  }

  private normalizeApiKey(apiKey?: string): string {
    return (apiKey || '').trim().replace(/^Bearer\s+/i, '').trim();
  }

  private requireApiKey(apiKey?: string) {
    const normalizedApiKey = this.normalizeApiKey(apiKey);
    if (!normalizedApiKey) {
      throw new BadRequestException('API Key 不能为空');
    }
    return normalizedApiKey;
  }

  private normalizeProviderModel(providerModel: any) {
    return typeof providerModel?.toJSON === 'function' ? providerModel.toJSON() : providerModel;
  }

  private async getPublicModel(publicModelId?: string) {
    if (!publicModelId || !Types.ObjectId.isValid(publicModelId)) {
      throw new BadRequestException('请选择公共模型');
    }

    const publicModel = await this.aiModelModel.findById(publicModelId).exec();
    if (!publicModel) {
      throw new NotFoundException('公共模型不存在');
    }
    return publicModel;
  }

  async createProvider(providerData: Partial<AiProvider> & { apiKey?: string }, userId: string): Promise<any> {
    const existingProvider = await this.aiProviderModel
      .findOne({ name: providerData.name })
      .exec();
    if (existingProvider) {
      throw new BadRequestException('服务商名称已存在');
    }

    const apiKey = this.requireApiKey(providerData.apiKey);

    const created = await this.aiProviderModel.create({
      type: 'openai-compatible',
      enabled: true,
      priority: 100,
      timeoutMs: 60000,
      ...this.buildProviderPayload({ ...providerData, apiKey }),
      creator: userId,
    });
    return this.sanitizeProvider(created);
  }

  async updateProvider(
    providerId: string,
    updateData: Partial<AiProvider> & { apiKey?: string },
    userId: string,
  ): Promise<any> {
    const provider = await this.aiProviderModel.findById(providerId).exec();
    if (!provider) {
      throw new NotFoundException('服务商不存在');
    }

    if (updateData.name && updateData.name !== provider.name) {
      const existingProvider = await this.aiProviderModel
        .findOne({ name: updateData.name })
        .exec();
      if (existingProvider) {
        throw new BadRequestException('服务商名称已存在');
      }
    }

    const nextApiKey = this.requireApiKey(
      updateData.apiKey !== undefined ? updateData.apiKey : this.getApiKey(provider),
    );
    Object.assign(provider, this.buildProviderPayload({ ...updateData, apiKey: nextApiKey }));
    provider.updatedAt = new Date();
    provider.updater = userId;
    const saved = await provider.save();
    return this.sanitizeProvider(saved);
  }

  async deleteProvider(providerId: string): Promise<boolean> {
    const provider = await this.aiProviderModel.findById(providerId).exec();
    if (!provider) {
      throw new NotFoundException('服务商不存在');
    }

    const implementationCount = await this.providerModel.countDocuments({ provider: providerId }).exec();
    if (implementationCount > 0) {
      throw new BadRequestException('该服务商下存在模型，无法删除');
    }

    const result = await this.aiProviderModel.deleteOne({ _id: providerId }).exec();
    return result.deletedCount > 0;
  }

  async getProviderById(providerId: string): Promise<any> {
    const provider = await this.aiProviderModel.findById(providerId).exec();
    if (!provider) {
      throw new NotFoundException('服务商不存在');
    }
    return this.sanitizeProvider(provider, { includeApiKey: true });
  }

  async listProviderModels(providerId: string): Promise<any[]> {
    await this.getProviderById(providerId);
    const providerModels = await this.providerModel
      .find({ provider: providerId })
      .sort({ priority: -1, createdAt: -1 })
      .populate('publicModel', 'name publicName displayName contextWindow inputPricePer1K outputPricePer1K enabled')
      .exec();
    return providerModels.map((item) => this.normalizeProviderModel(item));
  }

  async createProviderModel(providerId: string, body: ProviderModelDto, userId: string): Promise<any> {
    await this.getProviderById(providerId);
    const publicModel = await this.getPublicModel(body.publicModel);

    const existing = await this.providerModel
      .findOne({
        provider: providerId,
        publicModel: publicModel._id,
        upstreamModel: body.upstreamModel,
      })
      .exec();
    if (existing) {
      throw new BadRequestException('该服务商模型已存在');
    }

    const created = await this.providerModel.create({
      provider: new Types.ObjectId(providerId),
      publicModel: publicModel._id,
      upstreamModel: body.upstreamModel,
      priority: body.priority ?? 100,
      enabled: body.enabled ?? true,
      tag: body.tag || 'proxy',
      costInputPricePer1K: body.costInputPricePer1K ?? 0,
      costOutputPricePer1K: body.costOutputPricePer1K ?? 0,
      creator: userId,
    });

    return this.providerModel
      .findById(created._id)
      .populate('publicModel', 'name publicName displayName contextWindow inputPricePer1K outputPricePer1K enabled')
      .exec();
  }

  async updateProviderModel(
    providerId: string,
    providerModelId: string,
    body: UpdateProviderModelDto,
    userId: string,
  ): Promise<any> {
    await this.getProviderById(providerId);
    const providerModel = await this.providerModel
      .findOne({ _id: providerModelId, provider: providerId })
      .exec();
    if (!providerModel) {
      throw new NotFoundException('模型不存在');
    }

    const publicModel = body.publicModel
      ? await this.getPublicModel(body.publicModel)
      : null;
    const nextPublicModel = publicModel?._id || providerModel.publicModel;
    const nextUpstreamModel = body.upstreamModel || providerModel.upstreamModel;
    const existing = await this.providerModel
      .findOne({
        _id: { $ne: providerModelId },
        provider: providerId,
        publicModel: nextPublicModel,
        upstreamModel: nextUpstreamModel,
      })
      .exec();
    if (existing) {
      throw new BadRequestException('该服务商模型已存在');
    }

    if (publicModel) {
      providerModel.publicModel = publicModel._id as any;
    }
    if (body.upstreamModel !== undefined) {
      providerModel.upstreamModel = body.upstreamModel;
    }
    if (body.priority !== undefined) {
      providerModel.priority = body.priority;
    }
    if (body.enabled !== undefined) {
      providerModel.enabled = body.enabled;
    }
    if (body.tag !== undefined) {
      providerModel.tag = body.tag;
    }
    if (body.costInputPricePer1K !== undefined) {
      providerModel.costInputPricePer1K = body.costInputPricePer1K;
    }
    if (body.costOutputPricePer1K !== undefined) {
      providerModel.costOutputPricePer1K = body.costOutputPricePer1K;
    }
    providerModel.updater = userId;
    await providerModel.save();

    return this.providerModel
      .findById(providerModel._id)
      .populate('publicModel', 'name publicName displayName contextWindow inputPricePer1K outputPricePer1K enabled')
      .exec();
  }

  async deleteProviderModel(providerId: string, providerModelId: string): Promise<{ success: boolean }> {
    await this.getProviderById(providerId);
    const result = await this.providerModel.deleteOne({ _id: providerModelId, provider: providerId }).exec();
    return { success: result.deletedCount > 0 };
  }

  async getProviderForCall(providerId: string): Promise<AiProviderDocument> {
    const provider = await this.aiProviderModel.findById(providerId).exec();
    if (!provider || !provider.enabled) {
      throw new NotFoundException('服务商不存在或已禁用');
    }
    return provider;
  }

  async getAllProviders(query: any = {}) {
    const { page = 1, pageSize = 10, q, search, enabled } = query;
    const keyword = q || search;
    const filter: any = {};
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { displayName: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (enabled !== undefined && enabled !== '') {
      filter.enabled = String(enabled) === 'true';
    }

    const [data, total] = await Promise.all([
      this.aiProviderModel
        .find(filter)
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .sort({ priority: -1, createdAt: -1 })
        .populate('creator')
        .populate('updater')
        .exec(),
      this.aiProviderModel.countDocuments(filter).exec(),
    ]);

    return Response.page(data.map((item) => this.sanitizeProvider(item)), { page, pageSize, total });
  }

  async getProviderOptions(): Promise<any[]> {
    const providers = await this.aiProviderModel
      .find({ enabled: true }, { encryptedApiKey: 0 })
      .sort({ priority: -1 })
      .exec();
    return providers.map((provider) => this.sanitizeProvider(provider));
  }

  async getAvailableProviders(): Promise<any[]> {
    return this.getProviderOptions();
  }

  async getProviderByName(name: string): Promise<any | null> {
    const provider = await this.aiProviderModel.findOne({ name, enabled: true }).exec();
    return this.sanitizeProvider(provider);
  }

  getApiKey(provider: AiProvider): string {
    return this.normalizeApiKey(this.secretService.decrypt(provider.encryptedApiKey));
  }

  normalizeBaseUrl(baseUrl: string): string {
    return baseUrl?.endsWith('/v1') ? baseUrl : `${(baseUrl || '').replace(/\/$/, '')}/v1`;
  }

  private getConnectionConfig(provider: AiProvider, override: Partial<AiProvider> & { apiKey?: string } = {}) {
    const baseUrl =
      override.baseUrl !== undefined ? String(override.baseUrl || '').trim() : String(provider.baseUrl || '').trim();
    if (!baseUrl) {
      throw new BadRequestException('请先配置 Base URL');
    }

    const apiKey =
      override.apiKey !== undefined ? this.normalizeApiKey(override.apiKey) : this.getApiKey(provider);
    if (!apiKey) {
      throw new BadRequestException('请先配置 API Key');
    }

    return {
      baseUrl,
      apiKey,
      timeoutMs: Number(override.timeoutMs ?? provider.timeoutMs ?? 60000),
      testModel:
        override.testModel !== undefined
          ? String(override.testModel || '').trim()
          : String(provider.testModel || '').trim(),
      priority: Number(override.priority ?? provider.priority ?? 100),
    };
  }

  async test(id: string, override: Partial<AiProvider> & { apiKey?: string } = {}) {
    const provider = await this.aiProviderModel.findById(id).exec();
    if (!provider) {
      throw new NotFoundException('服务商不存在');
    }
    const connection = this.getConnectionConfig(provider, override);

    try {
      const openai = new OpenAI({
        apiKey: connection.apiKey,
        baseURL: this.normalizeBaseUrl(connection.baseUrl),
        timeout: connection.timeoutMs,
      });
      let modelCount = 0;
      let testModel = connection.testModel;
      if (!testModel) {
        const models = await openai.models.list();
        modelCount = models.data?.length || 0;
        testModel = models.data?.[0]?.id || '';
      }
      if (!testModel) {
        throw new BadRequestException('请先配置测试模型，或确保上游模型列表不为空');
      }
      await openai.chat.completions.create({
        model: testModel,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        temperature: 0,
      });
      provider.lastTestStatus = 'success';
      provider.lastTestMessage = modelCount
        ? `连接成功，测试模型 ${testModel}，获取到 ${modelCount} 个模型`
        : `连接成功，测试模型 ${testModel}`;
      return {
        success: true,
        message: provider.lastTestMessage,
      };
    } catch (error) {
      provider.lastTestStatus = 'error';
      provider.lastTestMessage = error?.message || '连接失败';
      return {
        success: false,
        message: provider.lastTestMessage,
      };
    } finally {
      provider.lastTestedAt = new Date();
      await provider.save();
    }
  }

  async syncModels(id: string, userId: string, override: Partial<AiProvider> & { apiKey?: string } = {}) {
    const provider = await this.aiProviderModel.findById(id).exec();
    if (!provider) {
      throw new NotFoundException('服务商不存在');
    }
    const connection = this.getConnectionConfig(provider, override);

    const openai = new OpenAI({
      apiKey: connection.apiKey,
      baseURL: this.normalizeBaseUrl(connection.baseUrl),
      timeout: connection.timeoutMs,
    });
    const models = await openai.models.list();
    let createdPublicModels = 0;
    let createdProviderModels = 0;
    let existingProviderModels = 0;

    for (const item of models.data || []) {
      const upstreamModel = item.id;
      let publicModel = await this.aiModelModel
        .findOne({ $or: [{ publicName: upstreamModel }, { name: upstreamModel }] })
        .exec();
      if (!publicModel) {
        publicModel = await this.aiModelModel.create({
          name: upstreamModel,
          publicName: upstreamModel,
          displayName: upstreamModel,
          enabled: false,
          source: 'synced',
          creator: userId,
        });
        createdPublicModels += 1;
      } else if (!publicModel.publicName) {
        publicModel.publicName = publicModel.name;
        await publicModel.save();
      }

      const existing = await this.providerModel
        .findOne({ publicModel: publicModel._id, provider: provider._id, upstreamModel })
        .exec();
      if (existing) {
        existingProviderModels += 1;
        continue;
      }

      await this.providerModel.create({
        publicModel: publicModel._id,
        provider: provider._id,
        upstreamModel,
        priority: connection.priority,
        enabled: false,
        tag: 'proxy',
        source: 'synced',
        creator: userId,
      });
      createdProviderModels += 1;
    }

    return {
      success: true,
      total: models.data?.length || 0,
      createdPublicModels,
      createdProviderModels,
      existingProviderModels,
    };
  }
}
