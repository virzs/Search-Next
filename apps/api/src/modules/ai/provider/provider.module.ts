import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModelName, AiModelSchema } from '../models/ai-model.schema';
import { ProviderModelName, ProviderModelSchema } from '../models/provider-model.schema';
import { AiSecretModule } from '../secret/ai-secret.module';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { AiProviderName, AiProviderSchema } from './provider.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AiProviderName,
        schema: AiProviderSchema,
      },
      { name: AiModelName, schema: AiModelSchema },
      { name: ProviderModelName, schema: ProviderModelSchema },
    ]),
    AiSecretModule,
  ],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService, MongooseModule],
})
export class ProviderModule {}
