import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { AiProviderName, AiProviderSchema } from './provider.schema';
import {
  UserApiKeyName,
  UserApiKeySchema,
} from '../user-api-key/user-api-key.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AiProviderName,
        schema: AiProviderSchema,
      },
      {
        name: UserApiKeyName,
        schema: UserApiKeySchema,
      },
    ]),
  ],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
