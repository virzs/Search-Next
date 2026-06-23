import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThemeConfigService } from './theme-config.service';
import { ThemeConfigController } from './theme-config.controller';
import { ThemeConfigName, ThemeConfigSchema } from './theme-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThemeConfigName, schema: ThemeConfigSchema },
    ]),
  ],
  controllers: [ThemeConfigController],
  providers: [ThemeConfigService],
  exports: [ThemeConfigService],
})
export class ThemeConfigModule {}
