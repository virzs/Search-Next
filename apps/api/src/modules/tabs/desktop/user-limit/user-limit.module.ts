import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserLimitService } from './user-limit.service';
import { UserLimitController } from './user-limit.controller';
import {
  UserConfigLimitName,
  UserConfigLimitSchema,
} from './schemas/user-config-limit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserConfigLimitName, schema: UserConfigLimitSchema },
    ]),
  ],
  controllers: [UserLimitController],
  providers: [UserLimitService],
  exports: [UserLimitService],
})
export class UserLimitModule {}
