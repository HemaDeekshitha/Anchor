import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommunityPostReplies1788163200000
  implements MigrationInterface
{
  name = 'AddCommunityPostReplies1788163200000';

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

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE community_posts
        DROP CONSTRAINT IF EXISTS fk_community_posts_reply_to;
      DROP INDEX IF EXISTS idx_community_posts_reply_to;
      ALTER TABLE community_posts
        DROP COLUMN IF EXISTS "replyToPostId";
    `);
  }
}
