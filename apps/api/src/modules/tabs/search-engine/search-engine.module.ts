import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchEngineService } from './search-engine.service';
import { SearchEngineController } from './search-engine.controller';
import {
  SearchEngineName,
  SearchEngineSchema,
} from './schemas/search-engine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SearchEngineName, schema: SearchEngineSchema },
    ]),
  ],
  controllers: [SearchEngineController],
  providers: [SearchEngineService],
})
export class SearchEngineModule {}
