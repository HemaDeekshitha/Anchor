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
        SELECT
          EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'community_posts'
              AND column_name = 'replyToPostId'
          ) AS "coreSchemaReady",
          EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'post_media'
              AND column_name = 'originalFilename'
          ) AS "mediaFilenameReady",
          EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = current_schema()
              AND table_name = 'post_comment_votes'
          ) AS "commentVotesReady"
      `) as Promise<
        Array<{
          coreSchemaReady: boolean;
          mediaFilenameReady: boolean;
          commentVotesReady: boolean;
        }>
      >,
        this.cache.readiness().catch(() => 'disabled' as const),
      ]);

      // Only the core community column is deploy-blocking. Extra columns are
      // reported as warnings so a lagging migration cannot take the API down.
      if (!schema?.coreSchemaReady) {
        throw new Error('Community schema migration is incomplete');
      }

      const warnings: string[] = [];
      if (!schema.mediaFilenameReady) {
        warnings.push('post_media.originalFilename migration pending');
      }
      if (!schema.commentVotesReady) {
        warnings.push('post_comment_votes migration pending');
      }
      if (redis === 'disabled') {
        warnings.push(
          'REDIS_URL is unset or Redis is unreachable; community cache and queues are offline',
        );
      }

      return {
        status: 'ready',
        database: 'reachable',
        redis,
        communitySchema: 'ready',
        ...(warnings.length ? { warning: warnings.join('; ') } : {}),
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Database or required schema is unavailable',
      );
    }
  }
  // T: O(1) database round trip and S: O(1)
}
