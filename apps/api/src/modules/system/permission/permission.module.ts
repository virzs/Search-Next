import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from 'src/schemas/permission';
import { DiscoveryModule } from '@nestjs/core';
import { PermissionSyncService } from './permission-sync.service';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionSyncService],
  imports: [
    DiscoveryModule,
    MongooseModule.forFeature([
      {
        name: Permission.name,
        schema: PermissionSchema,
      },
    ]),
  ],
})
export class PermissionModule {}
