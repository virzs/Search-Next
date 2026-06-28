import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import OpenAI from 'openai';
import { AiBalanceService } from '../balance/ai-balance.service';
import { ConsumerKeyDocument } from '../consumer-key/consumer-key.schema';
import { ConsumerKeyService } from '../consumer-key/consumer-key.service';
import { AiModelService } from '../models/ai-model.service';
import { ProviderService } from '../provider/provider.service';
import { RequestLogService } from '../request-log/request-log.service';

export interface GatewayChatOptions {
  consumerKey?: ConsumerKeyDocument;
  res?: ExpressResponse;
  userId?: string;
}

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);

  constructor(
    private readonly aiModelService: AiModelService,
    private readonly providerService: ProviderService,
    private readonly consumerKeyService: ConsumerKeyService,
    private readonly requestLogService: RequestLogService,
    private readonly aiBalanceService: AiBalanceService,
  ) {}

  async listModels(consumerKey?: ConsumerKeyDocument) {
    const filter = await this.consumerKeyService.getAllowedModelFilter(consumerKey);
    const models = await this.aiModelService.listEnabled(filter);
    return {
      object: 'list',
      data: models.map((model) => ({
        id: model.publicName || model.name,
        object: 'model',
        created: Math.floor(new Date(model.createdAt || Date.now()).getTime() / 1000),
        owned_by: 'search-next',
        root: model.publicName || model.name,
        parent: null,
      })),
    };
  }

  async chatCompletions(body: any, options: GatewayChatOptions = {}) {
    const requestStartedAt = Date.now();
    if (!body?.model) {
      throw new BadRequestException('model 不能为空');
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      throw new BadRequestException('messages 不能为空');
    }

    const model = await this.aiModelService.findEnabledByName(body.model);
    if (!model) {
      throw new NotFoundException('模型不存在或已禁用');
    }

    if (options.consumerKey) {
      await this.consumerKeyService.assertModelAllowed(options.consumerKey, model as any);
      await this.aiBalanceService.ensurePositiveBalance(this.getOwnerUserId(options.consumerKey));
    }

    const providerModels = await this.aiModelService.getRunnableProviderModels(String(model._id));
    const runnableProviderModels = providerModels.filter((providerModel: any) => {
      const provider = providerModel.provider;
      return providerModel.enabled && provider?.enabled;
    });

    if (!runnableProviderModels.length) {
      throw new BadRequestException('模型没有可用服务商模型');
    }

    let lastError: any;
    let lastProviderModel: any;

    for (let index = 0; index < runnableProviderModels.length; index += 1) {
      const providerModel = runnableProviderModels[index];
      const startedAt = Date.now();
      const provider: any = providerModel.provider;

      try {
        const apiKey = this.providerService.getApiKey(provider);
        if (!apiKey) {
          throw new BadRequestException('请先配置 API Key');
        }
        const openai = new OpenAI({
          apiKey,
          baseURL: this.providerService.normalizeBaseUrl(provider.baseUrl),
          timeout: provider.timeoutMs || 60000,
        });
        const requestBody: any = {
          ...body,
          model: providerModel.upstreamModel,
        };

        if (body.stream) {
          requestBody.stream_options = {
            ...(requestBody.stream_options || {}),
            include_usage: true,
          };
          const stream = await openai.chat.completions.create(requestBody);
          await this.pipeStream(stream as any, options.res, {
            body,
            model,
            providerModel,
            provider,
            consumerKey: options.consumerKey,
            startedAt,
            fallbackIndex: index,
          });
          return undefined;
        }

        const completion = await openai.chat.completions.create(requestBody);
        await this.logSuccess({
          body,
          model,
          providerModel,
          provider,
          consumerKey: options.consumerKey,
          startedAt,
          usage: (completion as any).usage,
          stream: false,
          fallbackIndex: index,
        });
        if (options.consumerKey) {
          await this.consumerKeyService.touchUsage(String(options.consumerKey._id));
        }
        return completion;
      } catch (error) {
        lastError = error;
        lastProviderModel = providerModel;
        this.logger.warn(
          `AI 服务商模型调用失败，尝试 fallback: model=${body.model} provider=${provider?.name} upstream=${providerModel?.upstreamModel} error=${this.getErrorMessage(error)}`,
        );
      }
    }

    await this.logError({
      body,
      model,
      providerModel: lastProviderModel,
      consumerKey: options.consumerKey,
      startedAt: requestStartedAt,
      error: lastError,
      stream: !!body.stream,
      fallbackIndex: Math.max(runnableProviderModels.length - 1, 0),
    });
    throw new InternalServerErrorException(`AI 服务调用失败: ${this.getErrorMessage(lastError)}`);
  }

  private async pipeStream(
    stream: AsyncIterable<any>,
    res: ExpressResponse | undefined,
    context: any,
  ) {
    if (!res) {
      throw new BadRequestException('流式请求缺少响应对象');
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let usage: any;
    try {
      for await (const chunk of stream) {
        if (chunk?.usage) {
          usage = chunk.usage;
        }
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();

      await this.logSuccess({
        ...context,
        usage,
        stream: true,
      });
      if (context.consumerKey) {
        await this.consumerKeyService.touchUsage(String(context.consumerKey._id));
      }
    } catch (error) {
      const errorPayload = {
        error: {
          message: this.getErrorMessage(error),
          type: 'api_error',
        },
      };
      if (!res.headersSent) {
        res.status(500);
      }
      res.write(`data: ${JSON.stringify(errorPayload)}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      await this.logError({
        ...context,
        error,
        stream: true,
      });
    }
  }

  private async logSuccess(context: any) {
    const usage = context.usage;
    const estimatedCost = this.aiModelService.estimateCost(context.model, usage);
    const upstreamCost = this.aiModelService.estimateUpstreamCost(context.providerModel, usage);
    const billing = await this.settleBilling(context, estimatedCost, usage);

    await this.requestLogService.write({
      consumerKey: context.consumerKey?._id,
      consumerKeyPreview: context.consumerKey?.keyPreview,
      ownerUser: this.getOwnerUserId(context.consumerKey),
      aiModel: context.model?._id,
      modelName: context.model?.publicName || context.model?.name || context.body?.model,
      providerModel: context.providerModel?._id,
      provider: context.provider?._id,
      upstreamModel: context.providerModel?.upstreamModel,
      status: 'success',
      stream: !!context.stream,
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      estimatedCost,
      chargedIntegral: billing.chargedIntegral || 0,
      upstreamCost,
      balanceBefore: billing.balanceBefore,
      balanceAfter: billing.balanceAfter,
      billingStatus: billing.billingStatus,
      isFallback: Number(context.fallbackIndex || 0) > 0,
      fallbackIndex: context.fallbackIndex || 0,
      latencyMs: Date.now() - context.startedAt,
    } as any);
  }

  private async logError(context: any) {
    const providerModel = context.providerModel;
    const provider = providerModel?.provider;
    await this.requestLogService.write({
      consumerKey: context.consumerKey?._id,
      consumerKeyPreview: context.consumerKey?.keyPreview,
      ownerUser: this.getOwnerUserId(context.consumerKey),
      aiModel: context.model?._id,
      modelName: context.model?.publicName || context.model?.name || context.body?.model,
      providerModel: providerModel?._id,
      provider: provider?._id,
      upstreamModel: providerModel?.upstreamModel,
      status: 'error',
      stream: !!context.stream,
      estimatedCost: 0,
      chargedIntegral: 0,
      upstreamCost: 0,
      billingStatus: 'failed',
      isFallback: Number(context.fallbackIndex || 0) > 0,
      fallbackIndex: context.fallbackIndex || 0,
      latencyMs: Date.now() - context.startedAt,
      upstreamStatus: context.error?.status,
      errorMessage: this.getErrorMessage(context.error),
    } as any);
  }

  private async settleBilling(context: any, estimatedCost: number, usage?: any) {
    if (!context.consumerKey) {
      return {
        billingStatus: 'not_charged',
        chargedIntegral: 0,
        balanceBefore: undefined,
        balanceAfter: undefined,
      };
    }
    if (!usage) {
      return {
        billingStatus: 'no_usage',
        chargedIntegral: 0,
        balanceBefore: undefined,
        balanceAfter: undefined,
      };
    }
    return this.aiBalanceService.charge(
      this.getOwnerUserId(context.consumerKey),
      estimatedCost,
      `AI 调用 ${context.model?.publicName || context.model?.name}`,
    );
  }

  private getOwnerUserId(consumerKey?: ConsumerKeyDocument | any): string | undefined {
    const ownerUser = consumerKey?.ownerUser;
    if (!ownerUser) {
      return undefined;
    }
    return String(ownerUser._id || ownerUser);
  }

  private getErrorMessage(error: any): string {
    if (!error) {
      return '未知错误';
    }
    if (error instanceof ForbiddenException) {
      return error.message;
    }
    return error?.response?.data?.error?.message || error?.message || String(error);
  }
}
