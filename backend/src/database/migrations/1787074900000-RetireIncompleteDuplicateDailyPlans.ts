import { MigrationInterface, QueryRunner } from 'typeorm';

export class RetireIncompleteDuplicateDailyPlans1787074900000
  implements MigrationInterface
{
  name = 'RetireIncompleteDuplicateDailyPlans1787074900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // A removed duplicate can leave an untouched four-question plan with only
    // three active rows. Retire the rest of that day's pending plan only when
    // the user has not completed any question that day; the next normal load
    // then creates a complete fresh plan.
    await queryRunner.query(`
      UPDATE "user_daily_tasks" AS daily
      SET "status" = 'superseded'
      WHERE daily."status" = 'pending'
        AND EXISTS (
          SELECT 1
          FROM "user_daily_tasks" AS duplicate
          WHERE duplicate."user_id" = daily."user_id"
            AND duplicate."task_date" = daily."task_date"
            AND duplicate."status" = 'superseded'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM "user_daily_tasks" AS completed
          WHERE completed."user_id" = daily."user_id"
            AND completed."task_date" = daily."task_date"
            AND completed."status" = 'completed'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "user_daily_tasks" AS daily
      SET "status" = 'pending'
      WHERE daily."status" = 'superseded'
        AND NOT EXISTS (
          SELECT 1
          FROM "user_daily_tasks" AS active
          WHERE active."user_id" = daily."user_id"
            AND active."task_date" = daily."task_date"
            AND active."status" != 'superseded'
        )
    `);
  }
}
