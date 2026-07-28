import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGlobalCommunityPosts1753651000000
  implements MigrationInterface
{
  name = 'AddGlobalCommunityPosts1753651000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE community_posts
        ALTER COLUMN "communityId" DROP NOT NULL;

      CREATE INDEX IF NOT EXISTS idx_global_posts_feed
        ON community_posts(status, "createdAt" DESC, id DESC)
        WHERE "communityId" IS NULL;
    `);
  }
  // T: O(P log P) and S: O(1), where P is the number of existing posts indexed

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM community_posts WHERE "communityId" IS NULL;
      DROP INDEX IF EXISTS idx_global_posts_feed;
      ALTER TABLE community_posts
        ALTER COLUMN "communityId" SET NOT NULL;
    `);
  }
  // T: O(P) and S: O(1), where P is the number of global posts removed during rollback
}
