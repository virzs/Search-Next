import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response as ExpressResponse } from 'express';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';
import { ConsumerKeyGuard } from '../consumer-key/consumer-key.guard';
import { AiGatewayService } from './ai-gateway.service';

@ApiTags('AI/OpenAI Compatible Gateway')
@RequireLogin()
@UseGuards(ConsumerKeyGuard)
@Controller('ai/v1')
export class AiGatewayController {
  constructor(private readonly aiGatewayService: AiGatewayService) {}

  @Get('models')
  @ApiOperation({ summary: 'OpenAI-compatible 模型列表' })
  listModels(@Req() req: Request) {
    return this.aiGatewayService.listModels(req.aiConsumerKey);
  }

  @Post('chat/completions')
  @ApiOperation({ summary: 'OpenAI-compatible Chat Completions' })
  async chatCompletions(
    @Body() body: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    try {
      return await this.aiGatewayService.chatCompletions(body, {
        consumerKey: req.aiConsumerKey,
        res,
      });
    } catch (error) {
      this.throwOpenAiError(error);
    }
  }

  private throwOpenAiError(error: any): never {
    const status = error?.getStatus?.() || error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const responseError = error?.response?.error;
    const message = responseError?.message || error?.response?.message || error?.message || 'AI 服务调用失败';
    throw new HttpException(
      {
        error: {
          message,
          type:
            responseError?.type ||
            (status === HttpStatus.UNAUTHORIZED ? 'authentication_error' : 'api_error'),
        },
      },
      status,
    );
  }
}
