import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CommunityOutboxEvent } from '../entities/community.entities';
import { CommunityQueueService } from '../infrastructure/community-queue.service';
import { CommunityCacheService } from '../infrastructure/community-cache.service';

type RecoverableMedia = {
  mediaId: string;
  postId: string;
  userId: string;
  providerAssetId: string;
  resourceType: 'image' | 'video';
};

@Injectable()
export class CommunityRecoveryService {
  private readonly logger = new Logger(CommunityRecoveryService.name);
  private recovering = false;

  constructor(
    private readonly dataSource: DataSource,
    private readonly queue: CommunityQueueService,
    private readonly cache: CommunityCacheService,
    @InjectRepository(CommunityOutboxEvent)
    private readonly outboxRepository: Repository<CommunityOutboxEvent>,
  ) {}
  // T: O(1) and S: O(1)

  @Interval(30_000)
  async recoverPendingJobs(): Promise<void> {
    if (this.recovering) return;
    this.recovering = true;
    try {
      const media = await this.dataSource.query<RecoverableMedia[]>(
        `SELECT m.id AS "mediaId", m."postId", p."authorId" AS "userId",
                m."providerAssetId", m."resourceType"
           FROM post_media m
           JOIN community_posts p ON p.id = m."postId"
          WHERE m.status = 'pending'
            AND m."createdAt" < now() - interval '10 seconds'
          ORDER BY m."createdAt" ASC
          LIMIT 100`,
      );
      for (const item of media) {
        await this.queue.enqueue({ name: 'media.verify', data: item });
      }
      const events = await this.outboxRepository.find({
        where: { processedAt: IsNull() },
        order: { createdAt: 'ASC' },
        take: 100,
      });
      for (const event of events) {
        await this.queue.enqueue({
          name: 'outbox.dispatch',
          data: { eventId: event.id },
        });
      }
      await this.deleteExpiredPollPosts();
    } catch (error) {
      this.logger.warn(`Pending job recovery failed: ${String(error)}`);
    } finally {
      this.recovering = false;
    }
  }
  // T: O(j) and S: O(j), where j is the bounded recovery batch

  private async deleteExpiredPollPosts(): Promise<void> {
    const expired = await this.dataSource.transaction(async (manager) => {
      const rows = (await manager.query(
        `UPDATE community_posts post
            SET status = 'deleted', "deletedAt" = now(), "updatedAt" = now()
           FROM polls poll
          WHERE poll."postId" = post.id
            AND poll."endsAt" IS NOT NULL
            AND poll."endsAt" <= now()
            AND post.status IN ('published', 'processing')
        RETURNING post.id, post."communityId"`,
      )) as Array<{ id: string; communityId: string | null }>;
      if (rows.length === 0) return rows;
      await manager.query(
        `UPDATE polls
            SET status = 'closed'
          WHERE "postId" = ANY($1::uuid[])`,
        [rows.map((row) => row.id)],
      );
      const counts = new Map<string, number>();
      for (const row of rows) {
        if (row.communityId) {
          counts.set(row.communityId, (counts.get(row.communityId) ?? 0) + 1);
        }
      }
      for (const [communityId, count] of counts) {
        await manager.query(
          `UPDATE communities
              SET "postCount" = GREATEST(0, "postCount" - $1)
            WHERE id = $2`,
          [count, communityId],
        );
      }
      return rows;
    });
    if (expired.length === 0) return;
    await Promise.all([
      this.cache.deleteByPrefix('community:global-posts:'),
      this.cache.deleteByPrefix('community:posts:'),
      this.cache.deleteByPrefix('community:feed:'),
    ]);
  }
  // T: O(e + c) and S: O(e + c), where e is expired polls and c is affected communities
}
