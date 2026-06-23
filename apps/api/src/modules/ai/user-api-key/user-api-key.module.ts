import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserApiKeyController } from './user-api-key.controller';
import { UserApiKeyService } from './user-api-key.service';
import { UserApiKeyName, UserApiKeySchema } from './user-api-key.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserApiKeyName,
        schema: UserApiKeySchema,
      },
    ]),
  ],
  controllers: [UserApiKeyController],
  providers: [UserApiKeyService],
  exports: [UserApiKeyService],
})
export class UserApiKeyModule {}
