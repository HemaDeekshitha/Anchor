import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { DataSource, Repository } from 'typeorm';
import {
  CommunityOutboxEvent,
  CommunityPost,
  PostMedia,
} from '../entities/community.entities';
import { CommunityCacheService } from '../infrastructure/community-cache.service';
import { CommunityMediaService } from '../infrastructure/community-media.service';

@Injectable()
@Processor('community', { concurrency: 8 })
export class CommunityProcessor extends WorkerHost {
  private readonly logger = new Logger(CommunityProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: CommunityCacheService,
    private readonly mediaService: CommunityMediaService,
    @InjectRepository(PostMedia)
    private readonly mediaRepository: Repository<PostMedia>,
    @InjectRepository(CommunityPost)
    private readonly postRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityOutboxEvent)
    private readonly outboxRepository: Repository<CommunityOutboxEvent>,
  ) {
    super();
  }
  // T: O(1) and S: O(1)

  async process(job: Job<Record<string, string>>): Promise<void> {
    if (job.name === 'media.verify') await this.verifyMedia(job.data);
    if (job.name === 'counters.reconcile')
      await this.reconcileCounters(job.data);
    if (job.name === 'outbox.dispatch') await this.dispatchOutbox(job.data);
  }
  // T: O(1) dispatch plus selected job cost and S: O(1)

  private async verifyMedia(data: Record<string, string>): Promise<void> {
    const media = await this.mediaRepository.findOneBy({ id: data.mediaId });
    if (!media || media.status === 'ready') return;
    try {
      const result = await this.mediaService.verifyAsset(
        data.userId,
        data.providerAssetId,
        data.resourceType as 'image' | 'video',
      );
      media.mimeType = String(result.format ?? data.resourceType);
      media.bytes = String(result.bytes ?? 0);
      media.width = result.width ?? null;
      media.height = result.height ?? null;
      media.durationMs = result.duration
        ? Math.round(Number(result.duration) * 1_000)
        : null;
      media.status = 'ready';
      await this.mediaRepository.save(media);
      const pending = await this.mediaRepository.countBy({
        postId: data.postId,
        status: 'pending',
      });
      if (pending === 0) {
        const publication = await this.dataSource.transaction(
          async (manager) => {
            const post = await manager.findOne(CommunityPost, {
              where: { id: data.postId },
              lock: { mode: 'pessimistic_write' },
            });
            if (!post || post.status !== 'processing') {
              return { published: false, communityId: null as string | null };
            }
            post.status = 'published';
            await manager.save(post);
            if (post.communityId) {
              await manager.increment(
                'communities',
                { id: post.communityId },
                'postCount',
                1,
              );
            }
            return { published: true, communityId: post.communityId };
          },
        );

        if (publication.published) {
          await this.cacheService.deleteByPrefix('community:global-posts:');
          if (publication.communityId) {
            await Promise.all([
              this.cacheService.deleteByPrefix(
                `community:posts:${publication.communityId}:`,
              ),
              this.cacheService.deleteByPrefix('community:feed:'),
            ]);
          }
        }
      }
    } catch (error) {
      await this.mediaRepository.update(
        { id: data.mediaId },
        { status: 'failed' },
      );
      this.logger.warn(`Media verification failed: ${String(error)}`);
      throw error;
    }
  }
  // T: O(log M) database work plus one provider call and S: O(1)

  private async reconcileCounters(data: Record<string, string>): Promise<void> {
    if (data.postId) {
      await this.dataSource.query(
        `UPDATE community_posts p SET
          "upvoteCount" = (SELECT COUNT(*) FROM post_votes v WHERE v."postId" = p.id AND v.value = 1),
          "downvoteCount" = (SELECT COUNT(*) FROM post_votes v WHERE v."postId" = p.id AND v.value = -1),
          "commentCount" = (SELECT COUNT(*) FROM post_comments c WHERE c."postId" = p.id AND c.status = 'published')
         WHERE p.id = $1`,
        [data.postId],
      );
    }
    if (data.communityId) {
      await this.dataSource.query(
        `UPDATE communities c SET
          "memberCount" = (SELECT COUNT(*) FROM community_members m WHERE m."communityId" = c.id AND m.status = 'active'),
          "postCount" = (SELECT COUNT(*) FROM community_posts p WHERE p."communityId" = c.id AND p.status = 'published')
         WHERE c.id = $1`,
        [data.communityId],
      );
    }
    if (data.pollId) {
      await this.dataSource.query(
        `UPDATE poll_options o SET "voteCount" =
          (SELECT COUNT(*) FROM poll_votes v WHERE v."optionId" = o.id)
         WHERE o."pollId" = $1`,
        [data.pollId],
      );
    }
  }
  // T: O(V + C + M + P) for affected aggregate rows and S: O(1)

  private async dispatchOutbox(data: Record<string, string>): Promise<void> {
    const event = await this.outboxRepository.findOneBy({ id: data.eventId });
    if (!event || event.processedAt) return;
    event.processedAt = new Date();
    event.attempts += 1;
    await this.outboxRepository.save(event);
  }
  // T: O(log E) and S: O(1), where E is the number of outbox events
}
