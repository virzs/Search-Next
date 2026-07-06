import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersName } from '../../users/schemas/ref-names';
import { UsersSchema } from '../../users/schemas/user';
import { AppName, AppSchema } from '../app/schemas/app.schema';
import { UserLimitModule } from '../desktop/user-limit/user-limit.module';
import { UserDataService } from './user-data.service';
import { UserDataController } from './user-data.controller';
import {
  UserDataSyncName,
  UserDataSyncSchema,
} from './schemas/user-data-sync.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDataSyncName, schema: UserDataSyncSchema },
      { name: AppName, schema: AppSchema },
      { name: UsersName, schema: UsersSchema },
    ]),
    UserLimitModule,
  ],
  controllers: [UserDataController],
  providers: [UserDataService],
})
export class UserDataModule {}
