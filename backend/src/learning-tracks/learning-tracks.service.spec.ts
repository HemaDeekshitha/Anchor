import { Repository } from 'typeorm';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { LearningTrack } from './learning-track.entity';
import { LearningTracksService } from './learning-tracks.service';
import { UserDailyTask } from '../rag/rag-daily-user-tasks.entity';

describe('LearningTracksService', () => {
  const trackRepo = {
    update: jest.fn(),
    create: jest.fn((value: Partial<LearningTrack>) => value),
    save: jest.fn((value: Partial<LearningTrack>) =>
      Promise.resolve({ id: 'track-1', ...value }),
    ),
    findOne: jest.fn(),
  } as unknown as Repository<LearningTrack>;

  const onboardingRepo = {
    findOne: jest.fn(),
  } as unknown as Repository<OnboardingResponse>;

  const completionQuery = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };
  const dailyTaskRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(completionQuery),
  } as unknown as Repository<UserDailyTask>;

  let service: LearningTracksService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LearningTracksService(
      trackRepo,
      onboardingRepo,
      dailyTaskRepo,
    );
  });

  it('publishes the three supported track lengths', () => {
    expect(service.getOptions().map((option) => option.durationMonths)).toEqual(
      [1, 3, 6],
    );
  });

  it('creates a role-specific 3-month roadmap', async () => {
    jest.spyOn(onboardingRepo, 'findOne').mockResolvedValue({
      dedicatedRole: 'Software Engineer',
      preferredRole: ['Software Engineer'],
    } as OnboardingResponse);

    const result = await service.create('user-1', {
      durationMonths: 3,
    });

    expect(result.targetRole).toBe('Software Engineer');
    expect(result.blueprintSlug).toBe('software-engineer');
    expect(result.roadmap.totalWeeks).toBe(12);
    expect(result.questionTarget).toBe(225);
    expect(result.roadmap.estimatedQuestionsMin).toBe(200);
    expect(result.roadmap.estimatedQuestionsMax).toBe(250);
    expect(result.roadmap.weeks).toHaveLength(12);
  });

  it('rejects unsupported plan lengths', async () => {
    await expect(
      service.create('user-1', {
        durationMonths: 2 as 1,
      }),
    ).rejects.toThrow('durationMonths must be 1, 3, or 6.');
  });

  it('completes the 1-month track and starts the 3-month track', async () => {
    const current = {
      id: 'one-month-track',
      userId: 'user-1',
      durationMonths: 1,
      questionTarget: 100,
      targetRole: 'Software Engineer',
      status: 'active',
    } as LearningTrack;
    jest.spyOn(service, 'getCurrent').mockResolvedValue(current);
    completionQuery.getRawOne.mockResolvedValue({ count: '100' });
    jest.spyOn(service, 'create').mockResolvedValue({
      id: 'three-month-track',
      durationMonths: 3,
      questionTarget: 225,
    } as LearningTrack);

    const result = await service.advanceIfComplete('user-1');

    expect(trackRepo.update).toHaveBeenCalledWith('one-month-track', {
      status: 'completed',
    });
    expect(service.create).toHaveBeenCalledWith('user-1', {
      durationMonths: 3,
    });
    expect(result?.nextTrack?.durationMonths).toBe(3);
  });
});
