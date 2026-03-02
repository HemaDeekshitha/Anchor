import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserPointsLedger } from './user-points-ledger.entity';
import { User } from '../users/user.entity';

/** Anchor Points awarded per completed task */
export const POINTS_PER_TASK = 25;

/** Anchor Points required to claim one "360 Point" */
export const CONVERSION_THRESHOLD = 100;

export interface PointsBalanceDto {
  anchorPoints: number;
  points360: number;
  pointsToNextConversion: number;
  progressPercent: number;
  canConvert: boolean;
}

export interface PointsHistoryEntryDto {
  id: number;
  type: 'task_earned' | 'converted_to_360';
  amount: number;
  taskId: number | null;
  createdAt: Date;
}

export interface PointsSummaryDto extends PointsBalanceDto {
  history: PointsHistoryEntryDto[];
}

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(UserPointsLedger)
    private ledgerRepo: Repository<UserPointsLedger>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    /** Used for the atomic conversion transaction */
    private dataSource: DataSource,
  ) {}

  // ── Public API ────────────────────────────────────────────────────────

  /**
   * Award 25 Anchor Points when a task is approved.
   *
   * Idempotent: if points have already been awarded for this task on this
   * user, the call is silently ignored so a resubmit cannot double-earn.
   */
  async awardTaskPoints(userId: string, taskId: number): Promise<void> {
    // Guard: one earn per (user, task) – prevents double-awarding on resubmit
    const alreadyAwarded = await this.ledgerRepo.findOne({
      where: { user_id: userId, task_id: taskId, type: 'task_earned' },
    });

    if (alreadyAwarded) {
      return; // silently skip – not an error
    }

    await this.ledgerRepo.save({
      user_id: userId,
      task_id: taskId,
      amount: POINTS_PER_TASK,
      type: 'task_earned',
    });
  }

  /**
   * Return the current Anchor Points balance + 360 Points count for a user.
   */
  async getBalance(userId: string): Promise<PointsBalanceDto> {
    const anchorPoints = await this.sumLedger(userId);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const points360 = user?.points_360 ?? 0;

    const pointsToNextConversion = Math.max(
      0,
      CONVERSION_THRESHOLD - anchorPoints,
    );
    const progressPercent = Math.min(
      100,
      Math.round((anchorPoints / CONVERSION_THRESHOLD) * 100),
    );

    return {
      anchorPoints,
      points360,
      pointsToNextConversion,
      progressPercent,
      canConvert: anchorPoints >= CONVERSION_THRESHOLD,
    };
  }

  /**
   * Full summary: balance + paginated history (most recent first).
   */
  async getSummary(userId: string): Promise<PointsSummaryDto> {
    const balance = await this.getBalance(userId);

    const entries = await this.ledgerRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    const history: PointsHistoryEntryDto[] = entries.map((e) => ({
      id: e.id,
      type: e.type,
      amount: e.amount,
      taskId: e.task_id,
      createdAt: e.created_at,
    }));

    return { ...balance, history };
  }

  /**
   * Convert 500 Anchor Points → 1 "360 Point".
   *
   * Uses a DB transaction so the debit and the 360 Point credit are
   * always atomic – the ledger never goes out of sync with users.points_360.
   */
  async convertTo360(userId: string): Promise<PointsBalanceDto> {
    // await (not return) so the code after the block is reachable
    await this.dataSource.transaction(async (manager) => {
      // Re-check balance inside the transaction to prevent race conditions
      const rows = await manager
        .getRepository(UserPointsLedger)
        .createQueryBuilder('l')
        .select('COALESCE(SUM(l.amount), 0)', 'total')
        .where('l.user_id = :userId', { userId })
        .getRawOne<{ total: string }>();

      const currentBalance = parseInt(rows?.total ?? '0', 10);

      if (currentBalance < CONVERSION_THRESHOLD) {
        throw new BadRequestException(
          `Not enough Anchor Points to convert. ` +
            `You have ${currentBalance} AP but need ${CONVERSION_THRESHOLD} AP.`,
        );
      }

      // 1. Debit 500 Anchor Points
      await manager.getRepository(UserPointsLedger).save({
        user_id: userId,
        task_id: null,
        amount: -CONVERSION_THRESHOLD,
        type: 'converted_to_360',
      });

      // 2. Increment 360 Points on the user row (atomic SQL increment)
      await manager
        .createQueryBuilder()
        .update(User)
        .set({ points_360: () => 'points_360 + 1' })
        .where('id = :userId', { userId })
        .execute();
    });

    // Transaction committed — return the fresh balance to the client
    return this.getBalance(userId);
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private async sumLedger(userId: string): Promise<number> {
    const result = await this.ledgerRepo
      .createQueryBuilder('l')
      .select('COALESCE(SUM(l.amount), 0)', 'total')
      .where('l.user_id = :userId', { userId })
      .getRawOne<{ total: string }>();

    return parseInt(result?.total ?? '0', 10);
  }
}
