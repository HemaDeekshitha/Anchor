import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CommunityCacheService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(CommunityCacheService.name);
  private readonly redis: Redis | null;
  private available = false;

  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL');
    this.redis = url
      ? new Redis(url, {
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          connectTimeout: 1_500,
        })
      : null;
  }
  // T: O(1) and S: O(1)

  async onModuleInit(): Promise<void> {
    if (!this.redis) {
      this.logger.warn('REDIS_URL is not set; cache will fail open');
      return;
    }
    try {
      await this.redis.connect();
      this.available = true;
      this.redis.on('ready', () => {
        this.available = true;
      });
      this.redis.on('close', () => {
        this.available = false;
      });
    } catch (error) {
      this.available = false;
      this.logger.warn(`Redis unavailable: ${String(error)}`);
    }
  }
  // T: O(1) network connection and S: O(1)

  async onApplicationShutdown(): Promise<void> {
    if (this.redis?.status === 'ready') await this.redis.quit();
  }
  // T: O(1) network operation and S: O(1)

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.available) return null;
    try {
      const value = await this.redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }
  // T: O(v) and S: O(v), where v is the serialized value size

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<void> {
    if (!this.redis || !this.available) return;
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Cache writes are deliberately fail-open.
    }
  }
  // T: O(v) and S: O(v), where v is the serialized value size

  async deleteKeys(...keys: string[]): Promise<void> {
    if (!this.redis || !this.available || keys.length === 0) return;
    try {
      await this.redis.del(...keys);
    } catch {
      // The database remains authoritative if invalidation is unavailable.
    }
  }
  // T: O(k) and S: O(k), where k is the number of keys

  async deleteByPrefix(prefix: string): Promise<void> {
    if (!this.redis || !this.available) return;
    let cursor = '0';
    try {
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) await this.redis.del(...keys);
      } while (cursor !== '0');
    } catch {
      // Expiration still bounds stale data if prefix invalidation fails.
    }
  }
  // T: O(K) and S: O(b), where K is cached keys and b is the scan batch size

  async consumeLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number }> {
    if (!this.redis || !this.available) {
      return { allowed: true, remaining: limit };
    }
    const script = `
      local current = redis.call('INCR', KEYS[1])
      if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
      return current
    `;
    try {
      const current = Number(
        await this.redis.eval(script, 1, key, windowSeconds),
      );
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
      };
    } catch {
      return { allowed: true, remaining: limit };
    }
  }
  // T: O(1) and S: O(1)
}
