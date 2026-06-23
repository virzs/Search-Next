import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async get(key: string): Promise<string | null> {
    return await this.cacheManager.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
