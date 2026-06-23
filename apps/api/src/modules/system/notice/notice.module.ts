import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SystemNoticeSchema,
  SystemNoticeSchemaName,
} from 'src/modules/system/notice/notice.schema';
import { NoticeController } from 'src/modules/system/notice/notice.controller';
import { NoticeService } from 'src/modules/system/notice/notice.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemNoticeSchemaName, schema: SystemNoticeSchema },
    ]),
  ],
  controllers: [NoticeController],
  providers: [NoticeService],
  exports: [NoticeService],
})
export class NoticeModule {}
