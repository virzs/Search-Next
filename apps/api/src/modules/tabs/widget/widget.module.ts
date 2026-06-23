import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { WidgetName, WidgetSchema } from './schemas/widget.schema';
import {
  WidgetVersionName,
  WidgetVersionSchema,
} from './schemas/widget-version.schema';
import { WidgetClassifyModule } from '../widget-classify/widget-classify.module';
import { ResourceModule } from 'src/modules/resource/resource.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WidgetName, schema: WidgetSchema },
      { name: WidgetVersionName, schema: WidgetVersionSchema },
    ]),
    WidgetClassifyModule,
    ResourceModule,
  ],
  controllers: [WidgetController],
  providers: [WidgetService],
  exports: [WidgetService],
})
export class WidgetModule {}
