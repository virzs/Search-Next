import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppName, AppSchema } from '../app/schemas/app.schema';
import {
  AppCollectionName,
  AppCollectionSchema,
} from './schemas/app-collection.schema';
import { AppCollectionController } from './app-collection.controller';
import { AppCollectionService } from './app-collection.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppCollectionName, schema: AppCollectionSchema },
      { name: AppName, schema: AppSchema },
    ]),
  ],
  controllers: [AppCollectionController],
  providers: [AppCollectionService],
})
export class AppCollectionModule {}
