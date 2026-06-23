import { Module } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { WebsiteController } from './website.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WebsiteClassifyName,
  WebsiteCollectionName,
  WebsiteName,
  WebsiteTagName,
} from './schemas/ref-names';
import { WebsiteSchema } from './schemas/website';
import { WebsiteClassifySchema } from './schemas/classify';
import { WebsiteTagSchema } from './schemas/tag';
import { ClassifyController } from './classify/classify.controller';
import { TagController } from './tag/tag.controller';
import { ClassifyService } from './classify/classify.service';
import { TagService } from './tag/tag.service';
import { CollectionController } from './collection/collection.controller';
import { CollectionService } from './collection/collection.service';
import { WebsiteCollectionSchema } from './schemas/collection';

@Module({
  controllers: [
    WebsiteController,
    ClassifyController,
    TagController,
    CollectionController,
  ],
  providers: [WebsiteService, ClassifyService, TagService, CollectionService],
  imports: [
    MongooseModule.forFeature([
      {
        name: WebsiteName,
        schema: WebsiteSchema,
      },
      {
        name: WebsiteClassifyName,
        schema: WebsiteClassifySchema,
      },
      {
        name: WebsiteTagName,
        schema: WebsiteTagSchema,
      },
      {
        name: WebsiteCollectionName,
        schema: WebsiteCollectionSchema,
      },
    ]),
  ],
})
export class WebsiteModule {}
