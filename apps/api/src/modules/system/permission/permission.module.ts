import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from 'src/schemas/permission';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Permission.name,
        schema: PermissionSchema,
      },
    ]),
  ],
})
export class PermissionModule {}
