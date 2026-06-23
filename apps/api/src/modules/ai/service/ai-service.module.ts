import { Module } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { ProviderModule } from '../provider/provider.module';
import { UserApiKeyModule } from '../user-api-key/user-api-key.module';
import { AiPresetModule } from '../preset/preset.module';

@Module({
  imports: [ProviderModule, UserApiKeyModule, AiPresetModule],
  providers: [AiServiceService],
  exports: [AiServiceService], // 导出服务供其他模块使用
})
export class AiServiceModule {}
