import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'src/utils/response';
import { AiRequestLog, AiRequestLogDocument, AiRequestLogName } from './request-log.schema';

@Injectable()
export class RequestLogService {
  private readonly logger = new Logger(RequestLogService.name);

  constructor(
    @InjectModel(AiRequestLogName)
    private requestLogModel: Model<AiRequestLogDocument>,
  ) {}

  async write(data: Partial<AiRequestLog>) {
    try {
      return await this.requestLogModel.create(data);
    } catch (error) {
      this.logger.warn(`写入 AI 调用日志失败: ${error?.message || error}`);
      return null;
    }
  }

  async page(query: any = {}) {
    const {
      page = 1,
      pageSize = 10,
      status,
      modelName,
      search,
      consumerKey,
      ownerUser,
      provider,
      billingStatus,
      startDate,
      endDate,
    } = query;
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    const keyword = modelName || search;
    if (keyword) {
      filter.modelName = { $regex: keyword, $options: 'i' };
    }
    if (consumerKey) {
      filter.consumerKey = consumerKey;
    }
    if (ownerUser) {
      filter.ownerUser = ownerUser;
    }
    if (provider) {
      filter.provider = provider;
    }
    if (billingStatus) {
      filter.billingStatus = billingStatus;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.requestLogModel
        .find(filter)
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .sort({ createdAt: -1 })
        .populate('consumerKey', 'name keyPreview')
        .populate('ownerUser', 'username email')
        .populate('aiModel', 'name displayName')
        .populate('providerModel', 'upstreamModel tag priority')
        .populate('provider', 'name displayName')
        .exec(),
      this.requestLogModel.countDocuments(filter).exec(),
    ]);

    return Response.page(data, { page, pageSize, total });
  }
}
