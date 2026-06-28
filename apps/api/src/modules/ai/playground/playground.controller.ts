import { Controller, All, Body, Res, Req } from '@nestjs/common';
import { Request, Response as ExpressResponse } from 'express';
import { PlaygroundService } from './playground.service';
import { OpenAIProxyRequestDto } from './dto/playground.dto';
import { User } from '../../../public/decorator/route-user.decoratpr';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('AI/Playground')
@Controller('ai/playground')
export class PlaygroundController {
  constructor(private readonly playgroundService: PlaygroundService) {}

  /**
   * 通用OpenAI代理接口 - 兼容所有OpenAI API路径
   * 支持 /v1/chat/completions, /v1/models 等所有标准接口
   */
  @All()
  @All('*')
  @ApiOperation({ summary: 'OpenAI通用代理接口' })
  @ApiResponse({ status: 200, description: '成功' })
  async universalProxy(
    @Req() req: Request,
    @Body() body: any,
    @User('_id') userId: string,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<any> {
    // 处理不同Content-Type的请求体数据
    let parsedBody = body;
    const contentType = req.headers['content-type'];

    // 如果是text/plain格式且body是字符串，尝试解析为JSON
    if (contentType?.includes('text/plain') && typeof body === 'string') {
      try {
        parsedBody = JSON.parse(body);
      } catch (error) {
        // JSON解析失败，使用原始body
      }
    }
    // 如果是application/x-www-form-urlencoded格式，使用之前的解析逻辑
    else if (contentType?.includes('application/x-www-form-urlencoded')) {
      try {
        const keys = Object.keys(body);
        if (keys.length === 1) {
          const firstKey = keys[0];
          const firstValue = body[firstKey];

          if (firstKey.includes('"model"') && firstKey.includes('"messages"')) {
            let fullJsonStr = firstKey;
            if (firstKey.endsWith('"messages":')) {
              const valueKeys = Object.keys(firstValue);
              if (valueKeys.length > 0) {
                const messagesStr = valueKeys[0];
                fullJsonStr = firstKey + '[' + messagesStr + ']}';
              } else {
                fullJsonStr = firstKey + '[]}';
              }
            }
            parsedBody = JSON.parse(fullJsonStr);
          } else {
            parsedBody = JSON.parse(firstKey);
          }
        }
      } catch (error) {
        // JSON解析失败，使用原始body
      }
    }

    // 正确处理路径，移除控制器前缀
    let path = req.path;
    if (path.startsWith('/ai/playground/')) {
      path = path.replace('/ai/playground/', '');
    } else if (path === '/ai/playground') {
      path = '';
    }
    const method = req.method.toUpperCase();

    // 处理不同的OpenAI接口
    if (method === 'POST' && path === 'v1/chat/completions') {
      // 聊天完成接口
      return await this.playgroundService.openaiProxy(
        userId,
        parsedBody as OpenAIProxyRequestDto,
        res,
      );
    } else if (method === 'GET' && path === 'v1/models') {
      // 模型列表接口
      return await this.playgroundService.listModels(userId);
    } else if (method === 'POST' && (path === '' || path === '/')) {
      // 兼容原有接口
      return await this.playgroundService.openaiProxy(
        userId,
        parsedBody as OpenAIProxyRequestDto,
        res,
      );
    } else {
      // 其他未实现的接口返回404
      res.status(404).json({
        error: {
          message: `接口 ${method} ${path} 暂未实现`,
          type: 'not_found_error',
        },
      });
    }
  }
}
