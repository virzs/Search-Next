import { Module } from '@nestjs/common';
import { PlaygroundController } from './playground.controller';
import { PlaygroundService } from './playground.service';
import { AiGatewayModule } from '../gateway/ai-gateway.module';

@Module({
  imports: [AiGatewayModule],
  controllers: [PlaygroundController],
  providers: [PlaygroundService],
  exports: [PlaygroundService],
})
export class PlaygroundModule {}
