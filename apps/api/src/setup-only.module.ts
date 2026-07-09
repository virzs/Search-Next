import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getRuntimeEnvFilePaths } from './config/env';
import { SetupModule } from './modules/setup/setup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getRuntimeEnvFilePaths(),
      ignoreEnvFile: false,
      ignoreEnvVars: false,
      isGlobal: true,
    }),
    SetupModule,
  ],
})
export class SetupOnlyModule {}
