import { Module } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { AiGatewayModule } from '../gateway/ai-gateway.module';

@Module({
  imports: [AiGatewayModule],
  providers: [AiServiceService],
  exports: [AiServiceService], // 导出服务供其他模块使用
})
export class AiServiceModule {}
