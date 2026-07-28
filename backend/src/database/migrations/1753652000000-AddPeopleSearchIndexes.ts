import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPeopleSearchIndexes1753652000000 implements MigrationInterface {
  name = 'AddPeopleSearchIndexes1753652000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;

      CREATE INDEX IF NOT EXISTS idx_users_name_trgm
        ON users USING gin (LOWER(name) gin_trgm_ops);

      CREATE INDEX IF NOT EXISTS idx_users_email_trgm
        ON users USING gin (LOWER(email) gin_trgm_ops);

      CREATE INDEX IF NOT EXISTS idx_onboarding_user_id
        ON onboarding_responses ("userId");

      CREATE INDEX IF NOT EXISTS idx_onboarding_role_trgm
        ON onboarding_responses USING gin (
          LOWER(COALESCE(
            "dedicatedRole",
            "preferredRole"[1],
            "currentStatus"[1],
            ''
          )) gin_trgm_ops
        );
    `);
  }
  // T: O(U log U) and S: O(U), where U is indexed users and profiles

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_onboarding_role_trgm;
      DROP INDEX IF EXISTS idx_onboarding_user_id;
      DROP INDEX IF EXISTS idx_users_email_trgm;
      DROP INDEX IF EXISTS idx_users_name_trgm;
    `);
  }
  // T: O(1) and S: O(1)
}
