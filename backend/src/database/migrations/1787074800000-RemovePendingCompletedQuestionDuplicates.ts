import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePendingCompletedQuestionDuplicates1787074800000
  implements MigrationInterface
{
  name = 'RemovePendingCompletedQuestionDuplicates1787074800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Retire only pending assignments whose normalized title was already
    // completed by the same user on or before that assignment date. Keeping
    // the row makes this cleanup auditable and fully reversible.
    await queryRunner.query(`
      UPDATE "user_daily_tasks" AS pending
      SET "status" = 'superseded'
      FROM "rag_tasks" AS pending_task
      WHERE pending."task_id" = pending_task."id"
        AND pending."status" = 'pending'
        AND EXISTS (
          SELECT 1
          FROM "user_daily_tasks" AS completed
          INNER JOIN "rag_tasks" AS completed_task
            ON completed_task."id" = completed."task_id"
          WHERE completed."user_id" = pending."user_id"
            AND completed."status" = 'completed'
            AND completed."task_date" <= pending."task_date"
            AND LOWER(TRIM(completed_task."title")) =
                LOWER(TRIM(pending_task."title"))
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "user_daily_tasks"
      SET "status" = 'pending'
      WHERE "status" = 'superseded'
    `);
  }
}
