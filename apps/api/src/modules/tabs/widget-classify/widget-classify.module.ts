import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WidgetClassifyController } from './widget-classify.controller';
import { WidgetClassifyService } from './widget-classify.service';
import {
  WidgetClassifyName,
  WidgetClassifySchema,
} from './schemas/widget-classify.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WidgetClassifyName, schema: WidgetClassifySchema },
    ]),
  ],
  controllers: [WidgetClassifyController],
  providers: [WidgetClassifyService],
  exports: [WidgetClassifyService],
})
export class WidgetClassifyModule {}
