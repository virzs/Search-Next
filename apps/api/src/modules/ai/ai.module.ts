import { Module } from '@nestjs/common';
import { ProviderModule } from './provider/provider.module';
import { UserApiKeyModule } from './user-api-key/user-api-key.module';
import { AiPresetModule } from './preset/preset.module';
import { AiServiceModule } from './service/ai-service.module';

@Module({
  imports: [ProviderModule, UserApiKeyModule, AiPresetModule, AiServiceModule],
  exports: [ProviderModule, UserApiKeyModule, AiPresetModule, AiServiceModule],
})
export class AiModule {}
