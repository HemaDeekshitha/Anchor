import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommunityCommentLikes1788152400000
  implements MigrationInterface
{
  name = 'AddCommunityCommentLikes1788152400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS post_comment_votes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "commentId" uuid NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
        "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_post_comment_vote_user UNIQUE ("commentId", "userId")
      );
      CREATE INDEX IF NOT EXISTS idx_post_comment_votes_comment
        ON post_comment_votes("commentId");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS post_comment_votes');
  }
}
