import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ProviderService } from '../provider/provider.service';
import { UserApiKeyService } from '../user-api-key/user-api-key.service';
import OpenAI from 'openai';

@Injectable()
export class AiServiceService {
  private readonly logger = new Logger(AiServiceService.name);
  constructor(
    private providerService: ProviderService,
    private userApiKeyService: UserApiKeyService,
  ) {}

  /**
   * 统一的OpenAI调用方法
   * @param request OpenAI请求参数
   * @param userId 用户ID（可选）
   * @returns OpenAI响应或Observable流
   */
  async callOpenAI(
    request: {
      providerId: string;
      model: string;
      messages: any[];
      stream?: boolean;
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      user?: string;
    },
    userId?: string,
  ): Promise<any> {
    try {
      // 验证服务商
      const provider = await this.providerService.getProviderById(
        request.providerId,
      );
      if (!provider.enabled) {
        this.logger.warn(`Provider disabled: id=${request.providerId}`);
        throw new BadRequestException('服务商已禁用');
      }

      // 获取API Key
      const apiKey = await this.getApiKey(userId, request.providerId, provider);

      // 创建OpenAI客户端
      const openai = this.createOpenAIClient(apiKey, provider.baseUrl);

      // 检查并过滤掉没有content的消息
      if (!request.messages || !Array.isArray(request.messages)) {
        this.logger.warn(
          `Invalid messages array: providerId=${request.providerId} model=${request.model}`,
        );
        throw new BadRequestException('消息数组不能为空');
      }

      const validMessages = request.messages.filter(
        (msg) => msg && msg.content && msg.content.trim(),
      );

      if (validMessages.length === 0) {
        this.logger.warn(
          `No valid messages: providerId=${request.providerId} model=${request.model}`,
        );
        throw new BadRequestException('至少需要一条有效消息');
      }

      // 调用OpenAI API
      const completion = await openai.chat.completions.create({
        model: request.model,
        messages: validMessages,
        stream: request.stream || false,
        temperature: request.temperature,
        max_tokens: request.max_tokens,
        top_p: request.top_p,
        frequency_penalty: request.frequency_penalty,
        presence_penalty: request.presence_penalty,
        user: request.user,
      });

      return completion;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new InternalServerErrorException(
          `AI服务调用失败: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        `AI服务调用失败: ${error.message}`,
      );
    }
  }

  /**
   * 创建统一的OpenAI客户端
   * @param apiKey API密钥
   * @param baseUrl 基础URL
   * @returns OpenAI客户端实例
   */
  createOpenAIClient(apiKey: string, baseUrl: string): OpenAI {
    return new OpenAI({
      apiKey: apiKey,
      baseURL: baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`,
    });
  }

  /**
   * 获取用户API密钥或服务商API密钥
   * @param userId 用户ID
   * @param providerId 服务商ID
   * @param provider 服务商信息
   * @returns API密钥
   */
  async getApiKey(
    userId: string | undefined,
    providerId: string,
    provider: any,
  ): Promise<string> {
    let apiKey: string | undefined;

    // 优先使用用户配置的API Key
    if (userId) {
      try {
        apiKey = await this.userApiKeyService.getApiKeyValue(
          userId,
          providerId,
        );
      } catch (error) {
        // 用户未配置API Key，继续使用服务商API Key
      }
    }

    // 如果没有用户API Key，使用服务商API Key
    if (!apiKey) {
      apiKey = provider.apiKey;
      if (!apiKey) {
        this.logger.warn(
          `API key not found: userId=${userId} providerId=${providerId}`,
        );
        throw new BadRequestException(
          '未找到可用的API Key，请提供API Key或配置服务商API Key',
        );
      }
    }

    return apiKey;
  }

  /**
   * 获取可用模型列表
   * @param providerId 服务商ID
   * @param userId 用户ID（可选）
   * @returns 模型列表
   */
  async getAvailableModels(
    providerId: string,
    userId?: string,
  ): Promise<any[]> {
    try {
      // 验证服务商
      const provider = await this.providerService.getProviderById(providerId);
      if (!provider.enabled) {
        this.logger.warn(`Provider disabled: id=${providerId}`);
        throw new BadRequestException('服务商已禁用');
      }

      // 获取API Key
      const apiKey = await this.getApiKey(userId, providerId, provider);

      // 创建OpenAI客户端
      const openai = this.createOpenAIClient(apiKey, provider.baseUrl);

      // 调用OpenAI models API
      const modelsResponse = await openai.models.list();

      return modelsResponse.data || [];
    } catch (error) {
      console.error('获取模型列表失败:', error);
      // 如果API调用失败，返回默认模型列表
      return [
        {
          id: 'gpt-3.5-turbo',
          name: 'gpt-3.5-turbo',
          provider: 'openai',
        },
        {
          id: 'gpt-4',
          name: 'gpt-4',
          provider: 'openai',
        },
      ];
    }
  }
}
