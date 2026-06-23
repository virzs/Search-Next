import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchProviderService } from './search-provider.service';
import { SearchProviderController } from './search-provider.controller';
import { DefaultProvidersSeed } from './seeds/default-providers.seed';
import {
  SearchProviderName,
  SearchProviderSchema,
} from './schemas/search-provider.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SearchProviderName, schema: SearchProviderSchema },
    ]),
  ],
  controllers: [SearchProviderController],
  providers: [SearchProviderService, DefaultProvidersSeed],
  exports: [SearchProviderService, DefaultProvidersSeed],
})
export class SearchProviderModule {}