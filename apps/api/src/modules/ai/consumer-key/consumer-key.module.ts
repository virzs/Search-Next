import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiSecretModule } from '../secret/ai-secret.module';
import { AiModelModule } from '../models/ai-model.module';
import { AiModelName, AiModelSchema } from '../models/ai-model.schema';
import { UsersName } from 'src/modules/users/schemas/ref-names';
import { UsersSchema } from 'src/modules/users/schemas/user';
import { ConsumerKeyController } from './consumer-key.controller';
import { ConsumerKeyGuard } from './consumer-key.guard';
import { ConsumerKeyService } from './consumer-key.service';
import { ConsumerKeyName, ConsumerKeySchema } from './consumer-key.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConsumerKeyName, schema: ConsumerKeySchema },
      { name: AiModelName, schema: AiModelSchema },
      { name: UsersName, schema: UsersSchema },
    ]),
    AiSecretModule,
    AiModelModule,
  ],
  controllers: [ConsumerKeyController],
  providers: [ConsumerKeyService, ConsumerKeyGuard],
  exports: [ConsumerKeyService, ConsumerKeyGuard, MongooseModule],
})
export class ConsumerKeyModule {}
