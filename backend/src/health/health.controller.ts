import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}
  // T: O(1) and S: O(1)

  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
  // T: O(1) and S: O(1)

  @Get('ready')
  async readiness() {
    try {
      const [schema] = (await this.dataSource.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'community_posts'
            AND column_name = 'replyToPostId'
        ) AS "communitySchemaReady"
      `)) as Array<{ communitySchemaReady: boolean }>;
      if (!schema?.communitySchemaReady) {
        throw new Error('Community schema migration is incomplete');
      }
      return {
        status: 'ready',
        database: 'reachable',
        communitySchema: 'ready',
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
