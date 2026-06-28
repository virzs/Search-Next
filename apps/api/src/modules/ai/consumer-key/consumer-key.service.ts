import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response } from 'src/utils/response';
import { AiSecretService } from '../secret/ai-secret.service';
import { AiModel, AiModelDocument, AiModelName } from '../models/ai-model.schema';
import { ConsumerKey, ConsumerKeyDocument, ConsumerKeyName } from './consumer-key.schema';
import { CreateConsumerKeyDto, UpdateConsumerKeyDto } from './dto/consumer-key.dto';
import { UsersName } from 'src/modules/users/schemas/ref-names';
import { User } from 'src/modules/users/schemas/user';

@Injectable()
export class ConsumerKeyService {
  constructor(
    @InjectModel(ConsumerKeyName)
    private consumerKeyModel: Model<ConsumerKeyDocument>,
    @InjectModel(AiModelName)
    private aiModelModel: Model<AiModelDocument>,
    @InjectModel(UsersName)
    private usersModel: Model<User>,
    private secretService: AiSecretService,
  ) {}

  private sanitizeKey(key: any) {
    if (!key) {
      return key;
    }

    const raw = typeof key.toJSON === 'function' ? key.toJSON() : key;
    const { keyHash, ...safe } = raw;
    return safe;
  }

  async create(body: CreateConsumerKeyDto, userId: string): Promise<any> {
    const rawKey = this.secretService.generateConsumerKey();
    const allowedModels = await this.normalizeAllowedModels(body.allowedModels);
    const ownerUser = await this.normalizeOwnerUser(body.ownerUser);
    const key = await this.consumerKeyModel.create({
      ...body,
      ownerUser,
      allowedModels,
      enabled: body.enabled ?? true,
      keyHash: this.secretService.hash(rawKey),
      keyPreview: this.secretService.preview(rawKey),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      creator: userId,
    });

    return {
      ...this.sanitizeKey(key),
      plainKey: rawKey,
    };
  }

  async update(id: string, body: UpdateConsumerKeyDto, userId: string): Promise<any> {
    const key = await this.consumerKeyModel.findById(id).exec();
    if (!key) {
      throw new NotFoundException('API Key 不存在');
    }

    const updateData: any = { ...body, updater: userId };
    if (body.ownerUser) {
      updateData.ownerUser = await this.normalizeOwnerUser(body.ownerUser);
    }
    if (body.allowedModels) {
      updateData.allowedModels = await this.normalizeAllowedModels(body.allowedModels);
    }
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
    }

    Object.assign(key, updateData);
    const saved = await key.save();
    return this.sanitizeKey(saved);
  }

  async page(query: any = {}): Promise<any> {
    const { page = 1, pageSize = 10, q, search, enabled } = query;
    const keyword = q || search;
    const filter: any = {};
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { keyPreview: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (enabled !== undefined && enabled !== '') {
      filter.enabled = String(enabled) === 'true';
    }

    const [data, total] = await Promise.all([
      this.consumerKeyModel
        .find(filter, { keyHash: 0 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .sort({ createdAt: -1 })
        .populate('ownerUser', 'username email')
        .populate('allowedModels', 'name publicName displayName')
        .populate('creator')
        .populate('updater')
        .exec(),
      this.consumerKeyModel.countDocuments(filter).exec(),
    ]);

    return Response.page(data, { page, pageSize, total });
  }

  async detail(id: string): Promise<any> {
    const key = await this.consumerKeyModel
      .findById(id, { keyHash: 0 })
      .populate('ownerUser', 'username email')
      .populate('allowedModels', 'name publicName displayName')
      .exec();
    if (!key) {
      throw new NotFoundException('API Key 不存在');
    }
    return this.sanitizeKey(key);
  }

  async remove(id: string): Promise<any> {
    await this.consumerKeyModel.deleteOne({ _id: id }).exec();
    return { success: true };
  }

  async toggle(id: string, userId: string): Promise<any> {
    const key = await this.consumerKeyModel.findById(id).exec();
    if (!key) {
      throw new NotFoundException('API Key 不存在');
    }
    key.enabled = !key.enabled;
    key.updater = userId;
    const saved = await key.save();
    return this.sanitizeKey(saved);
  }

  async reset(id: string, userId: string): Promise<any> {
    const key = await this.consumerKeyModel.findById(id).exec();
    if (!key) {
      throw new NotFoundException('API Key 不存在');
    }
    const rawKey = this.secretService.generateConsumerKey();
    key.keyHash = this.secretService.hash(rawKey);
    key.keyPreview = this.secretService.preview(rawKey);
    key.updater = userId;
    await key.save();
    return {
      ...this.sanitizeKey(key),
      plainKey: rawKey,
    };
  }

  async validateRawKey(rawKey?: string): Promise<ConsumerKeyDocument> {
    if (!rawKey) {
      throw new UnauthorizedException('缺少 API Key');
    }
    const key = await this.consumerKeyModel
      .findOne({ keyHash: this.secretService.hash(rawKey) })
      .populate('ownerUser', 'username email +integral')
      .exec();
    if (!key) {
      throw new UnauthorizedException('API Key 无效');
    }
    if (!key.enabled) {
      throw new ForbiddenException('API Key 已禁用');
    }
    if (key.expiresAt && key.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('API Key 已过期');
    }
    return key;
  }

  async assertModelAllowed(key: ConsumerKeyDocument, model: AiModel) {
    if (!key.allowedModels?.length) {
      return;
    }
    const allowed = key.allowedModels.some((item: any) => String(item) === String(model._id));
    if (!allowed) {
      throw new ForbiddenException('API Key 无权调用该模型');
    }
  }

  async touchUsage(id: string): Promise<void> {
    await this.consumerKeyModel
      .updateOne(
        { _id: id },
        {
          $inc: { usageCount: 1 },
          $set: { lastUsedAt: new Date() },
        },
      )
      .exec();
  }

  async getAllowedModelFilter(key?: ConsumerKeyDocument): Promise<any> {
    if (!key?.allowedModels?.length) {
      return { enabled: true };
    }
    return {
      enabled: true,
      _id: { $in: key.allowedModels.map((id) => new Types.ObjectId(String(id))) },
    };
  }

  private async normalizeAllowedModels(modelIds?: string[]): Promise<Types.ObjectId[]> {
    if (!modelIds?.length) {
      return [];
    }
    const ids = modelIds.map((id) => new Types.ObjectId(id));
    const count = await this.aiModelModel.countDocuments({ _id: { $in: ids } });
    if (count !== ids.length) {
      throw new NotFoundException('部分允许模型不存在');
    }
    return ids;
  }

  private async normalizeOwnerUser(userId: string): Promise<Types.ObjectId> {
    const user = await this.usersModel
      .findOne({ _id: userId, isDelete: { $in: [false, null] } })
      .select('+integral')
      .exec();
    if (!user) {
      throw new NotFoundException('所属用户不存在');
    }
    return new Types.ObjectId(userId);
  }
}
