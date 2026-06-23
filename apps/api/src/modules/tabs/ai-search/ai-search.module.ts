import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiSearchService } from './ai-search.service';
import { AiSearchController } from './ai-search.controller';
import {
  AiSearchRecordName,
  AiSearchRecordSchema,
} from './schemas/ai-search-record.schema';
import { AiServiceModule } from '../../ai/service/ai-service.module';
import { SearchProviderModule } from '../search-provider/search-provider.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiSearchRecordName, schema: AiSearchRecordSchema },
    ]),
    AiServiceModule,
    SearchProviderModule,
  ],
  controllers: [AiSearchController],
  providers: [AiSearchService],
  exports: [AiSearchService],
})
export class AiSearchModule {}