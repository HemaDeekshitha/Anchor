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
    this.redis?.on('ready', () => {
      this.available = true;
    });
    this.redis?.on('close', () => {
      this.available = false;
    });
    this.redis?.on('error', () => {
      this.available = false;
    });
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

  async readiness(): Promise<'reachable' | 'disabled'> {
    if (!this.redis) return 'disabled';
    if (!this.available) throw new Error('Redis is not connected');
    const response = await this.redis.ping();
    if (response !== 'PONG') throw new Error('Redis ping failed');
    return 'reachable';
  }
  // T: O(1) network round trip and S: O(1)

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

  async getVersion(namespace: string): Promise<number> {
    if (!this.redis || !this.available) return 0;
    try {
      const value = await this.redis.get(`community:ver:${namespace}`);
      return value ? Number(value) || 0 : 0;
    } catch {
      return 0;
    }
  }
  // T: O(1) and S: O(1)

  async bumpVersion(namespace: string): Promise<number> {
    if (!this.redis || !this.available) return 0;
    try {
      return Number(await this.redis.incr(`community:ver:${namespace}`)) || 0;
    } catch {
      return 0;
    }
  }
  // T: O(1) and S: O(1)

  /**
   * Writes a cached value only if the namespace version is unchanged.
   * Prevents a slow list request started before invalidation from
   * re-populating Redis with a stale page after a create/update.
   */
  async setJsonIfVersion(
    key: string,
    value: unknown,
    ttlSeconds: number,
    namespace: string,
    expectedVersion: number,
  ): Promise<boolean> {
    if (!this.redis || !this.available) return false;
    const script = `
      local current = redis.call('GET', KEYS[1])
      if (not current and tonumber(ARGV[1]) ~= 0) then
        return 0
      end
      if (current and tonumber(current) ~= tonumber(ARGV[1])) then
        return 0
      end
      redis.call('SET', KEYS[2], ARGV[2], 'EX', tonumber(ARGV[3]))
      return 1
    `;
    try {
      const written = Number(
        await this.redis.eval(
          script,
          2,
          `community:ver:${namespace}`,
          key,
          String(expectedVersion),
          JSON.stringify(value),
          String(ttlSeconds),
        ),
      );
      return written === 1;
    } catch {
      return false;
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

  async setCommunityTyping(
    communityId: string,
    userId: string,
    payload: { name: string; avatarUrl?: string | null },
  ): Promise<void> {
    if (!this.redis || !this.available) return;
    const key = `community:typing:${communityId}`;
    try {
      await this.redis.hset(
        key,
        userId,
        JSON.stringify({
          name: payload.name,
          avatarUrl: payload.avatarUrl ?? null,
          at: Date.now(),
        }),
      );
      await this.redis.expire(key, 6);
    } catch {
      // Typing presence is best-effort.
    }
  }
  // T: O(1) and S: O(1)

  async clearCommunityTyping(
    communityId: string,
    userId: string,
  ): Promise<void> {
    if (!this.redis || !this.available) return;
    try {
      await this.redis.hdel(`community:typing:${communityId}`, userId);
    } catch {
      // Typing presence is best-effort.
    }
  }
  // T: O(1) and S: O(1)

  async listCommunityTyping(
    communityId: string,
    excludeUserId?: string,
  ): Promise<
    Array<{ userId: string; name: string; avatarUrl: string | null }>
  > {
    if (!this.redis || !this.available) return [];
    try {
      const rows = await this.redis.hgetall(`community:typing:${communityId}`);
      const cutoff = Date.now() - 4_500;
      const active: Array<{
        userId: string;
        name: string;
        avatarUrl: string | null;
      }> = [];
      for (const [userId, raw] of Object.entries(rows)) {
        if (excludeUserId && userId === excludeUserId) continue;
        try {
          const parsed = JSON.parse(raw) as {
            name?: string;
            avatarUrl?: string | null;
            at?: number;
          };
          if (!parsed?.name || typeof parsed.at !== 'number') continue;
          if (parsed.at < cutoff) {
            void this.redis.hdel(`community:typing:${communityId}`, userId);
            continue;
          }
          active.push({
            userId,
            name: parsed.name,
            avatarUrl: parsed.avatarUrl ?? null,
          });
        } catch {
          // Skip malformed presence rows.
        }
      }
      return active;
    } catch {
      return [];
    }
  }
  // T: O(t) and S: O(t), where t is typing users

  private latestMarkerKey(communityId: string | null): string {
    return communityId
      ? `community:latest-post:${communityId}`
      : 'community:latest-post:global';
  }
  // T: O(1) and S: O(1)

  async setLatestPostMarker(
    communityId: string | null,
    marker: { id: string; createdAt: string },
  ): Promise<void> {
    if (!this.redis || !this.available) return;
    try {
      await this.redis.set(
        this.latestMarkerKey(communityId),
        JSON.stringify(marker),
        'EX',
        60 * 60 * 24,
      );
    } catch {
      // Marker cache is best-effort.
    }
  }
  // T: O(1) and S: O(1)

  async getLatestPostMarker(
    communityId: string | null,
  ): Promise<{ id: string; createdAt: string } | null> {
    if (!this.redis || !this.available) return null;
    try {
      const raw = await this.redis.get(this.latestMarkerKey(communityId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        id?: string;
        createdAt?: string;
      };
      if (!parsed?.id || !parsed?.createdAt) return null;
      return { id: parsed.id, createdAt: parsed.createdAt };
    } catch {
      return null;
    }
  }
  // T: O(1) and S: O(1)

  async clearLatestPostMarker(communityId: string | null): Promise<void> {
    if (!this.redis || !this.available) return;
    try {
      await this.redis.del(this.latestMarkerKey(communityId));
    } catch {
      // Marker cache is best-effort.
    }
  }
  // T: O(1) and S: O(1)
}
