import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import {
  Message,
  MessageSchema,
  MessageSchemaName,
} from './message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MessageSchemaName, schema: MessageSchema },
    ]),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
