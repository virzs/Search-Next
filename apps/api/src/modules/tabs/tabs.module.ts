import { Module } from '@nestjs/common';
import { TabsService } from './tabs.service';
import { TabsController } from './tabs.controller';
import { WebsiteModule } from './website/website.module';
import { UserDataModule } from './user-data/user-data.module';
import { SearchEngineModule } from './search-engine/search-engine.module';
import { AiSearchModule } from './ai-search/ai-search.module';
import { SearchProviderModule } from './search-provider/search-provider.module';
import { DesktopModule } from './desktop/desktop.module';
import { AppModule } from './app/app.module';
import { AppCollectionModule } from './app-collection/app-collection.module';

@Module({
  controllers: [TabsController],
  providers: [TabsService],
  imports: [
    WebsiteModule,
    UserDataModule,
    SearchEngineModule,
    AiSearchModule,
    SearchProviderModule,
    DesktopModule,
    AppModule,
    AppCollectionModule,
  ],
})
export class TabsModule {}
