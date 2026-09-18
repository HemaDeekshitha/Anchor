import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Production has been observed with DATABASE_MIGRATIONS_RUN skipped or stuck,
 * while the running entity model already expects newer community columns.
 * Apply the critical idempotent DDL here so media uploads cannot 500 on a
 * missing originalFilename column.
 */
@Injectable()
export class CommunitySchemaRepairService implements OnModuleInit {
  private readonly logger = new Logger(CommunitySchemaRepairService.name);

  constructor(private readonly dataSource: DataSource) {}
  // T: O(1) and S: O(1)

  async onModuleInit(): Promise<void> {
    try {
      await this.dataSource.query(`
        ALTER TABLE post_media
          ADD COLUMN IF NOT EXISTS "originalFilename" varchar(255);
      `);
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS post_comment_votes (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "commentId" uuid NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
          "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          CONSTRAINT uq_post_comment_vote_user UNIQUE ("commentId", "userId")
        );
      `);
      await this.dataSource.query(`
        CREATE INDEX IF NOT EXISTS idx_post_comment_votes_comment
          ON post_comment_votes("commentId");
      `);
      this.logger.log('Community schema repair checks completed');
    } catch (error) {
      this.logger.error(
        `Community schema repair failed: ${String(error)}`,
      );
    }
  }
  // T: O(1) DDL and S: O(1)
}
