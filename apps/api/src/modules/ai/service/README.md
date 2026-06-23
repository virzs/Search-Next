# AI服务模块使用说明

## 概述

AI服务模块提供了系统内部调用AI服务的通用方法，不提供HTTP接口，专门供其他模块内部使用。

## 功能特性

- **非流式调用**：`callAi()` - 标准的AI调用方法
- **流式调用**：`callAiStream()` - 支持实时流式响应
- **快速调用**：`quickCall()` - 简化的AI调用方法
- **多重API密钥支持**：支持用户自定义、用户配置和服务商配置的API密钥
- **预设配置**：支持AI预设配置的应用
- **错误处理**：完善的错误处理机制

## 使用方法

### 1. 在模块中导入AiServiceModule

```typescript
import { Module } from '@nestjs/common';
import { AiServiceModule } from '../ai/service/ai-service.module';
import { YourService } from './your.service';

@Module({
  imports: [AiServiceModule],
  providers: [YourService],
})
export class YourModule {}
```

### 2. 在服务中注入AiServiceService

```typescript
import { Injectable } from '@nestjs/common';
import { AiServiceService } from '../ai/service/ai-service.service';
import { AiServiceCallDto } from '../ai/service/dto/ai-service.dto';

@Injectable()
export class YourService {
  constructor(private readonly aiServiceService: AiServiceService) {}

  // 使用示例方法
  async processWithAi(content: string, userId?: string) {
    // 方法1: 使用快速调用
    const quickResponse = await this.aiServiceService.quickCall(
      'provider-id',
      'gpt-3.5-turbo',
      `请处理以下内容：${content}`,
      userId,
    );

    // 方法2: 使用完整调用
    const callDto: AiServiceCallDto = {
      providerId: 'provider-id',
      model: 'gpt-3.5-turbo',
      prompt: `请处理以下内容：${content}`,
      presetId: 'preset-id', // 可选
      config: {
        temperature: 0.7,
        max_tokens: 1000,
      },
    };

    const response = await this.aiServiceService.callAi(callDto, userId);

    if (response.success) {
      return response.response;
    } else {
      throw new Error(response.error);
    }
  }

  // 流式调用示例
  processWithAiStream(content: string, userId?: string) {
    const streamConfig = {
      providerId: 'provider-id',
      model: 'gpt-3.5-turbo',
      prompt: `请处理以下内容：${content}`,
      enableStream: true,
    };

    return this.aiServiceService.callAiStream(streamConfig, userId);
  }
}
```

### 3. 流式调用处理示例

```typescript
// 在控制器或服务中处理流式响应
async handleStreamResponse(content: string, userId: string) {
  const stream = this.yourService.processWithAiStream(content, userId);

  stream.subscribe({
    next: (data) => {
      if (data.type === 'content') {
        console.log('接收到内容:', data.content);
        // 处理流式内容
      } else if (data.type === 'done') {
        console.log('完整响应:', data.fullResponse);
        console.log('使用Token数:', data.tokensUsed);
      } else if (data.error) {
        console.error('错误:', data.error);
      }
    },
    error: (error) => {
      console.error('流式调用错误:', error);
    },
    complete: () => {
      console.log('流式调用完成');
    },
  });
}
```

## DTO说明

### AiServiceCallDto

- `providerId`: 服务商ID（必填）
- `model`: 模型名称（必填）
- `prompt`: 提示词（必填）
- `presetId`: 预设ID（可选）
- `apiKey`: API密钥（可选，优先使用此密钥）
- `config`: 额外配置（可选，如temperature、max_tokens等）

### AiServiceCallResponseDto

- `success`: 调用是否成功
- `response`: AI响应内容
- `tokensUsed`: 使用的token数量
- `responseTime`: 响应时间（毫秒）
- `model`: 使用的模型
- `provider`: 使用的服务商
- `error`: 错误信息（如果失败）
- `configUsed`: 实际使用的配置

## 注意事项

1. **API密钥优先级**：自定义API密钥 > 用户配置API密钥 > 服务商API密钥
2. **配置合并**：预设配置会与自定义配置合并，自定义配置优先级更高
3. **错误处理**：建议在调用时进行适当的错误处理
4. **流式调用**：流式调用返回Observable，需要订阅处理
5. **性能考虑**：对于大量并发调用，建议实现适当的限流机制

## 常见使用场景

- **内容生成**：文章生成、摘要提取等
- **数据处理**：文本分析、情感分析等
- **智能问答**：基于上下文的问答系统
- **代码生成**：代码补全、代码解释等
- **翻译服务**：多语言翻译
