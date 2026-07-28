import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

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
    try {
      await this.queue.add(job.name, job.data, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1_000 },
        removeOnComplete: 1_000,
        removeOnFail: 5_000,
      });
    } catch (error) {
      this.logger.warn(`Queue unavailable for ${job.name}: ${String(error)}`);
    }
  }
  // T: O(1) and S: O(1)
}
