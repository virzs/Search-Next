import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import db from './config/db';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import redis from './config/redis';
import email from './config/email';
import { LoginGuard } from './public/guard/login.guard';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import KeyvRedis from '@keyv/redis';
import { PermissionGuard } from './public/guard/permission.guard';
import { ResourceModule } from './modules/resource/resource.module';
import { AiModule } from './modules/ai/ai.module';
import qiniu from './config/qiniu';
import rateLimit from 'express-rate-limit';
import { ScheduleModule } from '@nestjs/schedule';
import cloudflareR2 from './config/cloudflare-r2';
import { CacheModule } from '@nestjs/cache-manager';
import storageService from './config/storage-service';
import { CleanupService } from './public/service/cleanup.service';
import { SystemModule } from './modules/system/system.module';
import { TabsModule } from './modules/tabs/tabs.module';
import { getRuntimeEnvFilePaths } from './config/env';
import { buildRedisUrl } from './config/redis-uri';
import { SetupModule } from './modules/setup/setup.module';
import { LegalConfirmationGuard } from './public/guard/legal-confirmation.guard';

@Module({
  imports: [
    /**
     * 加载配置文件 参考 .env.example
     */
    ConfigModule.forRoot({
      envFilePath: getRuntimeEnvFilePaths(),
      ignoreEnvFile: false,
      ignoreEnvVars: false,
      isGlobal: true,
      load: [
        /**
         * 数据库 配置
         */
        db,
        /**
         * redis 配置
         */
        redis,
        /**
         * 邮箱 配置
         */
        email,
        /**
         * 七牛云 配置
         */
        qiniu,
        /**
         * cloudflare R2 配置
         */
        cloudflareR2,
        /**
         * 第三方存储服务 配置
         */
        storageService,
      ],
    }),
    /**
     * mongoDB 连接配置
     */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get('MongoConfig'),
      inject: [ConfigService],
    }),
    /**
     * 缓存配置（仅 Redis）
     */
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get('redis.host');
        const port = config.get('redis.port');
        const password = config.get('redis.password');
        const db = config.get('redis.db');
        const ttl = config.get('redis.ttl');
        const redisUrl = buildRedisUrl({ host, port, password, db });

        return {
          ttl,
          stores: [new KeyvRedis(redisUrl)],
        };
      },
    }),
    // 定时任务
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    ResourceModule,
    SystemModule,
    AiModule,
    TabsModule,
    SetupModule,
  ],
  providers: [
    JwtService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: LegalConfirmationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    CleanupService,
  ],
})
export class AppModule {
  // 单个ip请求速率限制
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        rateLimit({
          windowMs: 60 * 1000,
          max: 100,
        }),
      )
      .forRoutes('*');
  }
}
