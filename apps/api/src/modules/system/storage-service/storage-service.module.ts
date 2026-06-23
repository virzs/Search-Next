import { Module } from '@nestjs/common';
import { CloudflareR2Service } from './cloudflare-r2/cloudflare-r2.service';
import { QiniuService } from './qiniu/qiniu.service';
import { LocalService } from './local/local.service';
import { RedisModule } from 'src/modules/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [CloudflareR2Service, QiniuService, LocalService],
  exports: [CloudflareR2Service, QiniuService, LocalService],
})
export class StorageServiceModule {}
