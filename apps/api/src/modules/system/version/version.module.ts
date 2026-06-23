import { Module } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionController } from './version.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VersionName, VersionSchema } from './schemas/version';

@Module({
  controllers: [VersionController],
  providers: [VersionService],
  imports: [
    MongooseModule.forFeature([
      {
        name: VersionName,
        schema: VersionSchema,
      },
    ]),
  ],
})
export class VersionModule {}
