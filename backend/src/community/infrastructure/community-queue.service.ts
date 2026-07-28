import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

const QUEUE_ENQUEUE_TIMEOUT_MS = 2_000;

export type CommunityJob =
  | {
      name: 'media.verify';
      data: {
        mediaId: string;
        postId: string;
        userId: string;
        providerAssetId: string;
        resourceType: 'image' | 'video';
      };
    }
  | {
      name: 'counters.reconcile';
      data: { communityId?: string; postId?: string; pollId?: string };
    }
  | {
      name: 'outbox.dispatch';
      data: { eventId: string };
    };

@Injectable()
export class CommunityQueueService {
  private readonly logger = new Logger(CommunityQueueService.name);

  constructor(@InjectQueue('community') private readonly queue: Queue) {}
  // T: O(1) and S: O(1)

  async enqueue(job: CommunityJob): Promise<void> {
    let timeout: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        this.queue.add(job.name, job.data, {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1_000 },
          removeOnComplete: 1_000,
          removeOnFail: 5_000,
        }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error('Queue enqueue timed out')),
            QUEUE_ENQUEUE_TIMEOUT_MS,
          );
        }),
      ]);
    } catch (error) {
      this.logger.warn(`Queue unavailable for ${job.name}: ${String(error)}`);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
  // T: O(1) and S: O(1)
}
