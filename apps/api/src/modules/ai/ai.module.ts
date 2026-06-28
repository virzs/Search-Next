import { Module } from '@nestjs/common';
import { ProviderModule } from './provider/provider.module';
import { AiPresetModule } from './preset/preset.module';
import { PlaygroundModule } from './playground/playground.module';
import { AiServiceModule } from './service/ai-service.module';
import { ComfyuiModule } from './comfyui/comfyui.module';
import { AiModelModule } from './models/ai-model.module';
import { ConsumerKeyModule } from './consumer-key/consumer-key.module';
import { RequestLogModule } from './request-log/request-log.module';
import { AiGatewayModule } from './gateway/ai-gateway.module';
import { AiBalanceModule } from './balance/ai-balance.module';

@Module({
  imports: [
    ProviderModule,
    AiPresetModule,
    AiModelModule,
    ConsumerKeyModule,
    RequestLogModule,
    AiBalanceModule,
    AiGatewayModule,
    PlaygroundModule,
    AiServiceModule,
    ComfyuiModule,
  ],
  controllers: [],
  providers: [],
  exports: [PlaygroundModule, AiServiceModule],
})
export class AiModule {}
