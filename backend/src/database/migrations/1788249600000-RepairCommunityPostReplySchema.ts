import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Repairs deployments where the original reply migration was recorded before
 * the column was actually available to the running API. Every operation is
 * idempotent and preserves all existing community posts.
 */
export class RepairCommunityPostReplySchema1788249600000
  implements MigrationInterface
{
  name = 'RepairCommunityPostReplySchema1788249600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE community_posts
        ADD COLUMN IF NOT EXISTS "replyToPostId" uuid;

      CREATE INDEX IF NOT EXISTS idx_community_posts_reply_to
        ON community_posts("replyToPostId");

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'fk_community_posts_reply_to'
            AND conrelid = 'community_posts'::regclass
        ) THEN
          ALTER TABLE community_posts
            ADD CONSTRAINT fk_community_posts_reply_to
            FOREIGN KEY ("replyToPostId")
            REFERENCES community_posts(id)
            ON DELETE SET NULL;
        END IF;
      END $$;
    `);
  }

  async down(): Promise<void> {
    // This repair migration intentionally has no destructive rollback. The
    // original migration owns removal of the nullable reply schema.
  }
}
