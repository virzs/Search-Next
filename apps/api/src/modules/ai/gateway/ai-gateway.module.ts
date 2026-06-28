import { Module } from '@nestjs/common';
import { AiBalanceModule } from '../balance/ai-balance.module';
import { ConsumerKeyModule } from '../consumer-key/consumer-key.module';
import { AiModelModule } from '../models/ai-model.module';
import { ProviderModule } from '../provider/provider.module';
import { RequestLogModule } from '../request-log/request-log.module';
import { AiGatewayController } from './ai-gateway.controller';
import { AiGatewayService } from './ai-gateway.service';

@Module({
  imports: [AiModelModule, ProviderModule, ConsumerKeyModule, RequestLogModule, AiBalanceModule],
  controllers: [AiGatewayController],
  providers: [AiGatewayService],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
