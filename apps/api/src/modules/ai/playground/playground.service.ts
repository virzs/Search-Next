import { Injectable, BadRequestException } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { AiGatewayService } from '../gateway/ai-gateway.service';
import { OpenAIProxyRequestDto } from './dto/playground.dto';

@Injectable()
export class PlaygroundService {
  constructor(private readonly aiGatewayService: AiGatewayService) {}

  /**
   * OpenAI代理服务 - 统一处理流式和非流式
   * @param userId 用户ID
   * @param request OpenAI请求数据
   * @param res Express响应对象（流式时使用）
   * @returns OpenAI响应数据（非流式时返回）
   */
  async openaiProxy(
    userId: string,
    request: OpenAIProxyRequestDto,
    res?: ExpressResponse,
  ): Promise<any> {
    try {
      // 判断是否为流式请求
      const isStream = request.stream && res;

      // 构建OpenAI请求参数
      const openaiRequest = {
        model: request.model,
        messages: request.messages,
        stream: !!isStream,
        temperature: request.temperature,
        max_tokens: request.max_tokens,
        top_p: request.top_p,
        frequency_penalty: request.frequency_penalty,
        presence_penalty: request.presence_penalty,
        user: request.user,
      };

      return this.aiGatewayService.chatCompletions(openaiRequest, {
        userId,
        res: isStream ? res : undefined,
      });
    } catch (error) {
      console.error('OpenAI代理调用失败:', error);

      if (request.stream && res) {
        // 流式错误处理
        const errorResponse = {
          error: {
            message: error.message || 'OpenAI流式代理调用失败',
            type: 'api_error',
          },
        };

        res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        // 非流式错误处理
        throw new BadRequestException(error.message || 'OpenAI代理调用失败');
      }
    }
  }

  /**
   * 获取可用模型列表
   * 兼容OpenAI的/v1/models接口格式
   * @param userId 用户ID
   * @returns 模型列表
   */
  async listModels(userId: string): Promise<any> {
    try {
      // 调用ai-service获取模型列表
      const models = await this.aiGatewayService.listModels();

      // 转换为OpenAI标准格式
      const openaiModels = models.data.map((model) => ({
        id: model.id,
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: model.owned_by || 'search-next',
        permission: [],
        root: model.id,
        parent: null,
      }));

      return {
        object: 'list',
        data: openaiModels,
      };
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw new BadRequestException(error.message || '获取模型列表失败');
    }
  }
}
