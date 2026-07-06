import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppClassifyController } from './app-classify.controller';
import { AppClassifyService } from './app-classify.service';
import {
  AppClassifyName,
  AppClassifySchema,
} from './schemas/app-classify.schema';
import { AppName, AppSchema } from '../app/schemas/app.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppClassifyName, schema: AppClassifySchema },
      { name: AppName, schema: AppSchema },
    ]),
  ],
  controllers: [AppClassifyController],
  providers: [AppClassifyService],
  exports: [AppClassifyService],
})
export class AppClassifyModule {}
