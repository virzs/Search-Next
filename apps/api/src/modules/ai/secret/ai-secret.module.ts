import { Module } from '@nestjs/common';
import { AiSecretService } from './ai-secret.service';

@Module({
  providers: [AiSecretService],
  exports: [AiSecretService],
})
export class AiSecretModule {}
