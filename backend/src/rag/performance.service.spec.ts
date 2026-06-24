import { Repository } from 'typeorm';
import { PerformanceService } from './performance.service';
import { UserDailyTask } from './rag-daily-user-tasks.entity';

describe('PerformanceService adaptive plan size', () => {
  function serviceFor(statuses: Array<'pending' | 'completed'>) {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest
        .fn()
        .mockResolvedValue(
          statuses.map((status) => ({ status }) as UserDailyTask),
        ),
    };
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<UserDailyTask>;
    return new PerformanceService(repository);
  }

  it('chooses a stable daily count between three and five', async () => {
    const service = serviceFor([]);
    const first = await service.getDifficultyMix('user-1');
    const second = await service.getDifficultyMix('user-1');
    expect(first.total).toBeGreaterThanOrEqual(3);
    expect(first.total).toBeLessThanOrEqual(5);
    expect(second.total).toBe(first.total);
  });

  it('keeps an on-track plan within the adaptive range', async () => {
    const mix = await serviceFor([
      'completed',
      'completed',
      'completed',
      'pending',
      'pending',
    ]).getDifficultyMix('user-1');
    expect(mix.performanceLevel).toBe('ontrack');
    expect(mix.total).toBeGreaterThanOrEqual(3);
    expect(mix.total).toBeLessThanOrEqual(5);
  });

  it('keeps excellent performance harder without fixing the volume', async () => {
    const mix = await serviceFor([
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
    ]).getDifficultyMix('user-1');
    expect(mix.performanceLevel).toBe('excellent');
    expect(mix.total).toBeGreaterThanOrEqual(3);
    expect(mix.total).toBeLessThanOrEqual(5);
    expect(mix.hard).toBeGreaterThan(mix.easy);
  });

  it('allows all three daily counts across users', async () => {
    const service = serviceFor([]);
    const mixes = await Promise.all(
      Array.from({ length: 100 }, (_, index) =>
        service.getDifficultyMix(`user-${index}`),
      ),
    );
    expect(new Set(mixes.map((mix) => mix.total))).toEqual(new Set([3, 4, 5]));
  });
});
