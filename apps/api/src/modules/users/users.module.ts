import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from 'src/modules/users/schemas/user';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  IntegralName,
  InvitationCodeName,
  UsersName,
} from './schemas/ref-names';
import { InvitationCodeController } from './invitation-code/invitation-code.controller';
import { InvitationCodeService } from './invitation-code/invitation-code.service';
import { InvitationCodeSchema } from './schemas/invitation-code';
import { RoleModule } from '../system/role/role.module';
import { IntegralSchema } from './schemas/integral';
import { IntegralService } from './integral/integral.service';
import { IntegralController } from './integral/integral.controller';

@Module({
  controllers: [InvitationCodeController, UsersController, IntegralController],
  providers: [UsersService, InvitationCodeService, IntegralService],
  imports: [
    MongooseModule.forFeature([
      {
        name: UsersName,
        schema: UsersSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: InvitationCodeName,
        schema: InvitationCodeSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: IntegralName,
        schema: IntegralSchema,
      },
    ]),
    RoleModule,
  ],
  exports: [UsersService, InvitationCodeService],
})
export class UsersModule {}
