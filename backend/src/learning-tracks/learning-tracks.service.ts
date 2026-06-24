import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { Repository } from 'typeorm';
import { CreateLearningTrackDto } from './dto/create-learning-track.dto';
import {
  LearningTrack,
  RoadmapPhase,
  TrackDurationMonths,
  TrackRoadmap,
} from './learning-track.entity';
import { getRoleBlueprint } from './role-blueprints';
import { UserDailyTask } from '../rag/rag-daily-user-tasks.entity';

const TRACK_OPTIONS = [
  {
    durationMonths: 1,
    name: 'Interview Essentials',
    description: 'Highest-priority topics for an interview coming soon.',
    totalWeeks: 4,
  },
  {
    durationMonths: 3,
    name: 'Structured Preparation',
    description: 'Foundations, applied practice, advanced topics, and mocks.',
    totalWeeks: 12,
  },
  {
    durationMonths: 6,
    name: 'Comprehensive Mastery',
    description: 'Complete role coverage, specialization, and interview loops.',
    totalWeeks: 24,
  },
] as const;

@Injectable()
export class LearningTracksService {
  constructor(
    @InjectRepository(LearningTrack)
    private readonly trackRepo: Repository<LearningTrack>,
    @InjectRepository(OnboardingResponse)
    private readonly onboardingRepo: Repository<OnboardingResponse>,
    @InjectRepository(UserDailyTask)
    private readonly dailyTaskRepo: Repository<UserDailyTask>,
  ) {}

  getOptions() {
    return TRACK_OPTIONS;
  }

  async getCurrent(userId: string) {
    return this.trackRepo.findOne({
      where: { userId, status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateLearningTrackDto) {
    this.validateInput(dto);
    const profile = await this.onboardingRepo.findOne({ where: { userId } });
    const targetRole =
      profile?.dedicatedRole ?? profile?.preferredRole?.[0] ?? null;
    if (!targetRole) {
      throw new BadRequestException(
        'Complete onboarding and choose a target role before starting a plan.',
      );
    }

    const blueprint = getRoleBlueprint(targetRole);
    const duration = dto.durationMonths;
    const startDate = this.toDateString(new Date());
    const targetDateValue = new Date();
    targetDateValue.setDate(
      targetDateValue.getDate() + this.weeksFor(duration) * 7,
    );

    await this.trackRepo.update(
      { userId, status: 'active' },
      { status: 'paused' },
    );

    const track = this.trackRepo.create({
      userId,
      targetRole,
      blueprintSlug: blueprint.slug,
      blueprintVersion: blueprint.version,
      durationMonths: duration,
      questionTarget: this.questionTargetFor(duration),
      learningDaysPerWeek: 5,
      startDate,
      targetDate: this.toDateString(targetDateValue),
      status: 'active',
      roadmap: this.buildRoadmap(
        duration,
        blueprint.competencies.map((item) => item.name),
      ),
    });

    return this.trackRepo.save(track);
  }

  async update(userId: string, dto: CreateLearningTrackDto) {
    const current = await this.getCurrent(userId);
    if (!current) return this.create(userId, dto);
    return this.create(userId, {
      durationMonths: dto.durationMonths ?? current.durationMonths,
    });
  }

  async advanceIfComplete(userId: string) {
    const current = await this.getCurrent(userId);
    if (!current) return null;

    const target =
      current.questionTarget ?? this.questionTargetFor(current.durationMonths);
    const completedQuestions = await this.dailyTaskRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.track_id = :trackId', { trackId: current.id })
      .andWhere('udt.status = :status', { status: 'completed' })
      .select('COUNT(DISTINCT udt.task_id)', 'count')
      .getRawOne<{ count: string }>();
    const completedCount = Number(completedQuestions?.count ?? 0);
    if (completedCount < target) return null;

    await this.trackRepo.update(current.id, { status: 'completed' });
    const nextDuration: TrackDurationMonths | null =
      current.durationMonths === 1
        ? 3
        : current.durationMonths === 3
          ? 6
          : null;
    const nextTrack = nextDuration
      ? await this.create(userId, { durationMonths: nextDuration })
      : null;

    return {
      completedTrack: {
        id: current.id,
        durationMonths: current.durationMonths,
        questionTarget: target,
        targetRole: current.targetRole,
      },
      nextTrack: nextTrack
        ? {
            id: nextTrack.id,
            durationMonths: nextTrack.durationMonths,
            questionTarget: nextTrack.questionTarget,
          }
        : null,
      allTracksCompleted: nextTrack === null,
    };
  }

  private validateInput(dto: CreateLearningTrackDto) {
    if (![1, 3, 6].includes(dto.durationMonths)) {
      throw new BadRequestException('durationMonths must be 1, 3, or 6.');
    }
  }

  private weeksFor(duration: TrackDurationMonths) {
    return duration === 1 ? 4 : duration === 3 ? 12 : 24;
  }

  private questionTargetFor(duration: TrackDurationMonths) {
    return duration === 1 ? 100 : duration === 3 ? 225 : 500;
  }

  private buildRoadmap(
    duration: TrackDurationMonths,
    competencies: string[],
  ): TrackRoadmap {
    const phaseTemplates = this.phaseTemplates(duration);
    const phases: RoadmapPhase[] = [];
    let nextWeek = 1;

    for (let index = 0; index < phaseTemplates.length; index++) {
      const template = phaseTemplates[index];
      const startWeek = nextWeek;
      const endWeek = startWeek + template.weeks - 1;
      const phaseCompetencies = competencies.filter(
        (_, competencyIndex) =>
          competencyIndex % phaseTemplates.length === index ||
          (index === phaseTemplates.length - 1 && competencyIndex < 2),
      );
      phases.push({
        name: template.name,
        startWeek,
        endWeek,
        outcome: template.outcome,
        competencies:
          phaseCompetencies.length > 0
            ? phaseCompetencies
            : competencies.slice(0, 2),
      });
      nextWeek = endWeek + 1;
    }

    const totalWeeks = this.weeksFor(duration);
    const weeks = Array.from({ length: totalWeeks }, (_, index) => {
      const week = index + 1;
      const phase = phases.find(
        (candidate) => week >= candidate.startWeek && week <= candidate.endWeek,
      )!;
      const first = competencies[(index * 2) % competencies.length];
      const second = competencies[(index * 2 + 1) % competencies.length];
      return {
        week,
        phase: phase.name,
        focus: [first, second],
        milestone:
          week === totalWeeks
            ? 'Final mixed mock interview and readiness review'
            : `Checkpoint: demonstrate applied understanding of ${first}`,
      };
    });

    return {
      totalWeeks,
      learningDaysPerWeek: 5,
      estimatedQuestionsMin: duration === 1 ? 100 : duration === 3 ? 200 : 500,
      estimatedQuestionsMax: duration === 1 ? 100 : duration === 3 ? 250 : 500,
      phases,
      weeks,
    };
  }

  private phaseTemplates(duration: TrackDurationMonths) {
    if (duration === 1) {
      return [
        {
          name: 'Foundation Verification',
          weeks: 2,
          outcome:
            'Verify mandatory fundamentals before accelerating into harder interviews.',
        },
        {
          name: 'High-Frequency Depth',
          weeks: 1,
          outcome: 'Handle harder common interview patterns.',
        },
        {
          name: 'Interview Simulation',
          weeks: 1,
          outcome: 'Perform under timed interview conditions.',
        },
      ];
    }
    if (duration === 3) {
      return [
        {
          name: 'Foundations',
          weeks: 4,
          outcome: 'Build reliable prerequisite knowledge.',
        },
        {
          name: 'Applied Skill',
          weeks: 4,
          outcome: 'Solve realistic, cross-topic scenarios.',
        },
        {
          name: 'Advanced Patterns',
          weeks: 2,
          outcome: 'Explain trade-offs and complex decisions.',
        },
        {
          name: 'Mocks & Gap Closure',
          weeks: 2,
          outcome: 'Convert knowledge into interview performance.',
        },
      ];
    }
    return [
      {
        name: 'Foundations',
        weeks: 6,
        outcome: 'Build complete role foundations.',
      },
      {
        name: 'Core Domain Coverage',
        weeks: 6,
        outcome: 'Cover every required core competency.',
      },
      {
        name: 'Advanced Application',
        weeks: 5,
        outcome: 'Solve complex and ambiguous scenarios.',
      },
      {
        name: 'Specialization',
        weeks: 3,
        outcome: 'Develop depth aligned with resume and goals.',
      },
      {
        name: 'Cross-Topic Integration',
        weeks: 2,
        outcome: 'Connect competencies in interview loops.',
      },
      {
        name: 'Simulation & Remediation',
        weeks: 2,
        outcome: 'Prove retained readiness and repair final gaps.',
      },
    ];
  }

  private toDateString(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}
