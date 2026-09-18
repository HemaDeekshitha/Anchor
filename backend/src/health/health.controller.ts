import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommunityCacheService } from '../community/infrastructure/community-cache.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cache: CommunityCacheService,
  ) {}
  // T: O(1) and S: O(1)

  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
  // T: O(1) and S: O(1)

  @Get('ready')
  async readiness() {
    try {
      const [[schema], redis] = await Promise.all([
        this.dataSource.query(`
        SELECT (
          EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'community_posts'
              AND column_name = 'replyToPostId'
          )
          AND EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'post_media'
              AND column_name = 'originalFilename'
          )
          AND EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = current_schema()
              AND table_name = 'post_comment_votes'
          )
        ) AS "communitySchemaReady"
      `) as Promise<Array<{ communitySchemaReady: boolean }>>,
        this.cache.readiness(),
      ]);
      if (!schema?.communitySchemaReady) {
        throw new Error('Community schema migration is incomplete');
      }
      const redisRequired =
        process.env.NODE_ENV === 'production' && redis === 'disabled';
      if (redisRequired) {
        // Keep the process up so deploys can still roll, but surface the
        // misconfiguration clearly — community cache/queues need Redis.
        return {
          status: 'degraded',
          database: 'reachable',
          redis,
          communitySchema: 'ready',
          warning: 'REDIS_URL is unset; community cache and queues are offline',
          timestamp: new Date().toISOString(),
        };
      }
      return {
        status: 'ready',
        database: 'reachable',
        redis,
        communitySchema: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Database, Redis, or required schema is unavailable',
      );
    }
  }
  // T: O(1) database round trip and S: O(1)
}
