import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderModelName, ProviderModelSchema } from '../models/provider-model.schema';
import { UsersName } from 'src/modules/users/schemas/ref-names';
import { UsersSchema } from 'src/modules/users/schemas/user';
import { RequestLogController } from './request-log.controller';
import { RequestLogService } from './request-log.service';
import { AiRequestLogName, AiRequestLogSchema } from './request-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiRequestLogName, schema: AiRequestLogSchema },
      { name: ProviderModelName, schema: ProviderModelSchema },
      { name: UsersName, schema: UsersSchema },
    ]),
  ],
  controllers: [RequestLogController],
  providers: [RequestLogService],
  exports: [RequestLogService, MongooseModule],
})
export class RequestLogModule {}
