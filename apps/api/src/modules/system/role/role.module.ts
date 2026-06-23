import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleName, RoleSchema } from 'src/modules/system/role/schemas/role';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  imports: [
    MongooseModule.forFeature([
      {
        name: RoleName,
        schema: RoleSchema,
      },
    ]),
  ],
})
export class RoleModule {}
