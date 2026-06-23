import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DesktopConfigService } from './desktop-config.service';
import { DesktopConfigController } from './desktop-config.controller';
import {
  AdminDesktopConfigName,
  AdminDesktopConfigSchema,
} from './schemas/admin-desktop-config.schema';
import {
  UserDesktopConfigName,
  UserDesktopConfigSchema,
} from './schemas/user-desktop-config.schema';
import { UserLimitModule } from '../user-limit/user-limit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminDesktopConfigName, schema: AdminDesktopConfigSchema },
      { name: UserDesktopConfigName, schema: UserDesktopConfigSchema },
    ]),
    UserLimitModule,
  ],
  controllers: [DesktopConfigController],
  providers: [DesktopConfigService],
  exports: [DesktopConfigService],
})
export class DesktopConfigModule {}
