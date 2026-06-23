import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectSchema } from 'src/modules/system/project/schemas/project';
import { ProjectName } from './schemas/ref-names';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  imports: [
    MongooseModule.forFeature([
      {
        name: ProjectName,
        schema: ProjectSchema,
      },
    ]),
  ],
  exports: [ProjectService],
})
export class ProjectModule {}
