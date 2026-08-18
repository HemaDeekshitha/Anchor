import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPendingOverflowPenaltyPointType1787073600000
  implements MigrationInterface
{
  name = 'AddPendingOverflowPenaltyPointType1787073600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'user_points_ledger_type_enum'
        ) THEN
          ALTER TYPE "user_points_ledger_type_enum"
            ADD VALUE IF NOT EXISTS 'pending_overflow_penalty';
        END IF;
      END
      $$;
    `);
  }
  // T: O(1) and S: O(1)

  async down(): Promise<void> {
    // PostgreSQL enum values cannot be safely removed while ledger rows may
    // still reference them. Keep the historical point transaction readable.
  }
  // T: O(1) and S: O(1)
}
