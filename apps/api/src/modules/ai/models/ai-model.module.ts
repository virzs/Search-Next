import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModelController } from './ai-model.controller';
import { AiModelService } from './ai-model.service';
import { AiModelName, AiModelSchema } from './ai-model.schema';
import { ProviderModelName, ProviderModelSchema } from './provider-model.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiModelName, schema: AiModelSchema },
      { name: ProviderModelName, schema: ProviderModelSchema },
    ]),
  ],
  controllers: [AiModelController],
  providers: [AiModelService],
  exports: [AiModelService, MongooseModule],
})
export class AiModelModule {}
