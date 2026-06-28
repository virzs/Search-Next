import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegralSchema } from 'src/modules/users/schemas/integral';
import { IntegralName, UsersName } from 'src/modules/users/schemas/ref-names';
import { UsersSchema } from 'src/modules/users/schemas/user';
import { AiBalanceController } from './ai-balance.controller';
import { AiBalanceService } from './ai-balance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersName, schema: UsersSchema },
      { name: IntegralName, schema: IntegralSchema },
    ]),
  ],
  controllers: [AiBalanceController],
  providers: [AiBalanceService],
  exports: [AiBalanceService, MongooseModule],
})
export class AiBalanceModule {}
