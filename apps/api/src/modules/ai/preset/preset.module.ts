import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiPresetController } from './preset.controller';
import { AiPresetService } from './preset.service';
import { AiPresetName, AiPresetSchema } from './preset.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiPresetName, schema: AiPresetSchema }]),
  ],
  controllers: [AiPresetController],
  providers: [AiPresetService],
  exports: [AiPresetService],
})
export class AiPresetModule {}
