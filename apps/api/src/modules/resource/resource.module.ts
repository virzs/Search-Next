import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourceSchema } from './schemas/resource';
import { ResourceAssociationName, ResourceName } from './schemas/ref-names';
import { StorageServiceModule } from '../system/storage-service/storage-service.module';
import { ResourceAssociationSchema } from './schemas/association';
import { ResourceImageService } from './resource-image.service';

@Module({
  controllers: [ResourceController],
  providers: [ResourceService, ResourceImageService],
  imports: [
    StorageServiceModule,
    MongooseModule.forFeature([
      {
        name: ResourceName,
        schema: ResourceSchema,
      },
      {
        name: ResourceAssociationName,
        schema: ResourceAssociationSchema,
      },
    ]),
  ],
  exports: [ResourceService],
})
export class ResourceModule {}
