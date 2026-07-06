import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppName, AppSchema } from './schemas/app.schema';
import {
  AppVersionName,
  AppVersionSchema,
} from './schemas/app-version.schema';
import { AppClassifyModule } from '../app-classify/app-classify.module';
import { ResourceModule } from 'src/modules/resource/resource.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppName, schema: AppSchema },
      { name: AppVersionName, schema: AppVersionSchema },
    ]),
    AppClassifyModule,
    ResourceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
