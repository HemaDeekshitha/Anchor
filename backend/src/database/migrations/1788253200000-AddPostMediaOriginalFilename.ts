import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostMediaOriginalFilename1788253200000
  implements MigrationInterface
{
  name = 'AddPostMediaOriginalFilename1788253200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE post_media
        ADD COLUMN IF NOT EXISTS "originalFilename" varchar(255);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE post_media
        DROP COLUMN IF EXISTS "originalFilename";
    `);
  }
}
