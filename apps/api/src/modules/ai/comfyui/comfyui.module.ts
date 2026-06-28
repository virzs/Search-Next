import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ComfyJobName,
  ComfyJobSchema,
} from './schemas/comfy-job';
import { ComfyuiController } from './comfyui.controller';
import { ComfyuiService } from './comfyui.service';
import { ResourceModule } from 'src/modules/resource/resource.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ComfyJobName, schema: ComfyJobSchema },
    ]),
    ResourceModule,
  ],
  controllers: [ComfyuiController],
  providers: [ComfyuiService],
  exports: [],
})
export class ComfyuiModule {}
