import { Injectable } from '@nestjs/common';
import { AiGatewayService } from '../gateway/ai-gateway.service';

@Injectable()
export class AiServiceService {
  constructor(private readonly aiGatewayService: AiGatewayService) {}

  /**
   * 统一的OpenAI调用方法
   * @param request OpenAI请求参数
   * @param userId 用户ID（可选）
   * @returns OpenAI响应或Observable流
   */
  async callOpenAI(
    request: {
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
    return this.aiGatewayService.chatCompletions(
      {
        ...request,
        stream: false,
      },
      { userId },
    );
  }

  async getAvailableModels(): Promise<any[]> {
    const result = await this.aiGatewayService.listModels();
    return result.data.map((model) => ({
      id: model.id,
      name: model.id,
      provider: model.owned_by,
    }));
  }
}
