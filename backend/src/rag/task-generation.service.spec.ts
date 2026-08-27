import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import {
  BlueprintDailyLane,
  getRoleBlueprint,
} from '../learning-tracks/role-blueprints';
import { UserSkill } from '../skills/user-skills.entity';
import { RagTask } from './rag-task.entity';
import {
  CurriculumContext,
  TaskGenerationService,
} from './task-generation.service';
import { UserSeenTask } from './user-seen-task.entity';

type Difficulty = 'easy' | 'medium' | 'hard';

interface TestTask {
  title: string;
  description?: string;
  category: string;
  difficulty: Difficulty;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  time_minutes: number;
  leetcodeUrl?: string;
  sourceKeywords?: string[];
  sourceResumePoint?: string | null;
  selectionReason?: string;
}

interface TaskGenerationInternals {
  buildDailyPrompt(
    profile: OnboardingResponse | null,
    skills: string[],
    mix: { easy: number; medium: number; hard: number; total: number },
    recentTitles?: string[],
    curriculum?: CurriculumContext,
    seenLeetcodeUrls?: string[],
  ): string;
  softwareCategoryForTask(task: TestTask): string;
  buildLeetcodeFallbackTask(
    difficulty: Difficulty,
    seenUrls: Set<string>,
    seenTitles: Set<string>,
  ): TestTask | null;
  buildRoleFallbackTasks(
    profile: OnboardingResponse | null,
    skills: string[],
    curriculum: CurriculumContext | undefined,
    mix: { easy: number; medium: number; hard: number; total: number },
    accepted: { easy: number; medium: number; hard: number },
    seenKeys: Set<string>,
    alreadyGenerated: number,
    usedCategories: Set<string>,
    softwareRole: boolean,
    dailyLanes: BlueprintDailyLane[],
  ): TestTask[];
  assertFinalPlanRequirements(
    tasks: TestTask[],
    mix: { easy: number; medium: number; hard: number; total: number },
    softwareRole: boolean,
    seenLeetcodeUrls: Set<string>,
    requiredCategories: string[],
    previouslySeenKeys: Set<string>,
  ): void;
}

describe('TaskGenerationService daily interview plan', () => {
  let service: TaskGenerationService;
  let internal: TaskGenerationInternals;

  beforeEach(() => {
    const config = {
      get: jest.fn((key: string) =>
        key === 'GEMINI_API_KEY' ? 'test-key' : undefined,
      ),
    } as unknown as ConfigService;
    service = new TaskGenerationService(
      {} as Repository<RagTask>,
      {} as Repository<OnboardingResponse>,
      {} as Repository<UserSkill>,
      {} as Repository<UserSeenTask>,
      config,
    );
    internal = service as unknown as TaskGenerationInternals;
  });

  it('requires four serious and distinct software interview lanes', () => {
    const profile = {
      dedicatedRole: 'Software Engineer',
      resumeText:
        'Reduced API latency by 30% using Redis caching and cache invalidation.',
      resumeKeywords: ['Redis', 'Node.js'],
    } as OnboardingResponse;

    const prompt = internal.buildDailyPrompt(profile, ['Redis', 'Node.js'], {
      easy: 2,
      medium: 1,
      hard: 1,
      total: 4,
    });

    expect(prompt).toContain('1 — "DSA" (MANDATORY LEETCODE)');
    expect(prompt).toContain('2 — "System Design"');
    expect(prompt).toContain('3 — "Behavioral"');
    expect(prompt).toContain('4 — "Resume & Project Deep-Dive"');
    expect(prompt).toContain('functional/non-functional requirements');
    expect(prompt).toContain('Never invent a metric');
    expect(prompt).not.toContain('How would you explain ${skill}');
  });

  it('preserves explicit resume and system-design lanes during categorization', () => {
    const baseTask: TestTask = {
      title: 'Walk me through the architecture and result?',
      category: 'Resume & Project Deep-Dive',
      difficulty: 'medium',
      priority: 'medium',
      tags: ['resume'],
      time_minutes: 25,
    };
    expect(internal.softwareCategoryForTask(baseTask)).toBe(
      'Resume & Project Deep-Dive',
    );
    expect(
      internal.softwareCategoryForTask({
        ...baseTask,
        category: 'System Design',
      }),
    ).toBe('System Design');
  });

  it('fills missing software lanes with substantive interview questions', () => {
    const profile = {
      dedicatedRole: 'Software Engineer',
      resumeText:
        'Reduced API latency by 30% using Redis caching and implemented cache invalidation for frequently requested records.',
    } as OnboardingResponse;

    const tasks = internal.buildRoleFallbackTasks(
      profile,
      ['Redis'],
      undefined,
      { easy: 2, medium: 1, hard: 1, total: 4 },
      { easy: 0, medium: 0, hard: 1 },
      new Set(),
      1,
      new Set(['dsa']),
      true,
      getRoleBlueprint('Software Engineer').dailyLanes,
    );

    expect(tasks.map((task) => task.category)).toEqual([
      'System Design',
      'Behavioral',
      'Resume & Project Deep-Dive',
    ]);
    expect(tasks[0].title).toContain('functional and non-functional');
    expect(tasks[2].title).toContain('Reduced API latency by 30%');
  });

  it('never reuses exhausted software fallback questions', () => {
    const profile = {
      dedicatedRole: 'Software Engineer',
      resumeText:
        'Reduced API latency by 30% using Redis caching and implemented cache invalidation for frequently requested records.',
    } as OnboardingResponse;
    const mix = { easy: 2, medium: 1, hard: 1, total: 4 };
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();

    for (let index = 0; index < 50; index++) {
      const task = internal.buildLeetcodeFallbackTask(
        'hard',
        seenUrls,
        seenTitles,
      );
      if (!task) break;
      expect(seenUrls.has(task.leetcodeUrl!)).toBe(false);
      expect(seenTitles.has(task.title.toLowerCase().trim())).toBe(false);
      seenUrls.add(task.leetcodeUrl!);
      seenTitles.add(task.title.toLowerCase().trim());
    }
    expect(seenUrls.size).toBeGreaterThan(5);

    const repeatedLeetcode = internal.buildLeetcodeFallbackTask(
      'hard',
      seenUrls,
      seenTitles,
    );
    expect(repeatedLeetcode).toBeNull();

    const firstFallback = internal.buildRoleFallbackTasks(
      profile,
      ['Redis'],
      undefined,
      mix,
      { easy: 0, medium: 0, hard: 1 },
      seenTitles,
      1,
      new Set(['dsa']),
      true,
      getRoleBlueprint('Software Engineer').dailyLanes,
    );
    const exhaustedTitles = new Set([
      ...seenTitles,
      ...firstFallback.map((task) => task.title.toLowerCase().trim()),
    ]);
    const priorSoftwareTitles = new Set(exhaustedTitles);
    const repairedFallback = internal.buildRoleFallbackTasks(
      profile,
      ['Redis'],
      undefined,
      mix,
      { easy: 0, medium: 0, hard: 1 },
      new Set(exhaustedTitles),
      1,
      new Set(['dsa']),
      true,
      getRoleBlueprint('Software Engineer').dailyLanes,
    );
    expect(repairedFallback).toHaveLength(3);
    expect(
      repairedFallback.every(
        (task) => !priorSoftwareTitles.has(task.title.toLowerCase().trim()),
      ),
    ).toBe(true);
  });
  // T: O(n) and S: O(n), where n is the curated fallback pool size

  it('keeps the mandatory experience lane fresh when no resume is uploaded', () => {
    const profile = {
      dedicatedRole: 'Software Engineer',
      resumeText: null,
    } as OnboardingResponse;
    const mix = { easy: 1, medium: 1, hard: 2, total: 4 };
    const firstPlan = internal.buildRoleFallbackTasks(
      profile,
      ['Elasticsearch', 'Node.js'],
      undefined,
      mix,
      { easy: 0, medium: 0, hard: 1 },
      new Set(),
      1,
      new Set(['dsa']),
      true,
      getRoleBlueprint('Software Engineer').dailyLanes,
    );
    const seenTitles = new Set(
      firstPlan.map((task) => task.title.toLowerCase().trim()),
    );
    const priorTitles = new Set(seenTitles);
    const nextPlan = internal.buildRoleFallbackTasks(
      profile,
      ['Elasticsearch', 'Node.js'],
      undefined,
      mix,
      { easy: 0, medium: 0, hard: 1 },
      seenTitles,
      1,
      new Set(['dsa']),
      true,
      getRoleBlueprint('Software Engineer').dailyLanes,
    );

    expect(nextPlan.map((task) => task.category)).toEqual([
      'System Design',
      'Behavioral',
      'Resume & Project Deep-Dive',
    ]);
    expect(
      nextPlan.every(
        (task) => !priorTitles.has(task.title.toLowerCase().trim()),
      ),
    ).toBe(true);
  });

  it('selects an unseen LeetCode problem and rejects an incomplete lane set', () => {
    const leetcode = internal.buildLeetcodeFallbackTask(
      'hard',
      new Set(['https://leetcode.com/problems/trapping-rain-water/']),
      new Set(),
    );
    expect(leetcode?.leetcodeUrl).toBe(
      'https://leetcode.com/problems/merge-k-sorted-lists/',
    );
    expect(leetcode?.title).toBe('Solve Merge K Sorted Lists.');
    expect(leetcode?.title).not.toMatch(
      /explain|compare|justify|derive|discuss/i,
    );
    expect(leetcode?.description).toContain('Submit only your code solution');

    const incompletePlan: TestTask[] = [
      leetcode!,
      {
        title: 'Design a rate limiter and defend the consistency trade-offs?',
        category: 'System Design',
        difficulty: 'medium',
        priority: 'medium',
        tags: ['rate limiting'],
        time_minutes: 40,
        sourceKeywords: ['rate limiting'],
      },
      {
        title: 'Tell me about a time you resolved a production incident?',
        category: 'Behavioral',
        difficulty: 'easy',
        priority: 'low',
        tags: ['incident response'],
        time_minutes: 25,
        sourceKeywords: ['incident response'],
      },
      {
        title: 'How would you diagnose a slow database query?',
        category: 'Databases',
        difficulty: 'easy',
        priority: 'low',
        tags: ['database indexing'],
        time_minutes: 25,
        sourceKeywords: ['database indexing'],
      },
    ];

    expect(() =>
      internal.assertFinalPlanRequirements(
        incompletePlan,
        { easy: 2, medium: 1, hard: 1, total: 4 },
        true,
        new Set(),
        ['dsa', 'system design', 'behavioral', 'resume project deep dive'],
        new Set(),
      ),
    ).toThrow('resume deep-dive');
  });

  it('builds profession-specific lanes from role, skills, and resume evidence', () => {
    const profile = {
      dedicatedRole: 'Business Analyst',
      resumeText:
        'Reduced order-processing time by 22% after mapping the fulfillment workflow and redesigning approval requirements.',
      resumeKeywords: ['process modeling', 'SQL', 'KPI design'],
    } as OnboardingResponse;
    const blueprint = getRoleBlueprint('Business Analyst');
    const prompt = internal.buildDailyPrompt(
      profile,
      ['process modeling', 'SQL'],
      { easy: 2, medium: 1, hard: 1, total: 4 },
    );

    for (const lane of blueprint.dailyLanes) {
      expect(prompt).toContain(`"${lane.category}"`);
    }
    expect(prompt).toContain('Never invent resume evidence');

    const tasks = internal.buildRoleFallbackTasks(
      profile,
      ['process modeling', 'SQL'],
      undefined,
      { easy: 2, medium: 1, hard: 1, total: 4 },
      { easy: 0, medium: 0, hard: 0 },
      new Set(),
      0,
      new Set(),
      false,
      blueprint.dailyLanes,
    );

    expect(tasks.map((task) => task.category)).toEqual(
      blueprint.dailyLanes.map((lane) => lane.category),
    );
    expect(tasks[0].title).toContain('dashboard');
    expect(tasks[2].title).toContain('Reduced order-processing time by 22%');
    expect(() =>
      internal.assertFinalPlanRequirements(
        tasks,
        { easy: 2, medium: 1, hard: 1, total: 4 },
        false,
        new Set(),
        blueprint.dailyLanes.map((lane) =>
          lane.category.toLowerCase().replace(/[^a-z0-9]+/g, ' '),
        ),
        new Set(),
      ),
    ).not.toThrow();
  });

  it('never reuses exhausted profession fallback questions', () => {
    const profile = {
      dedicatedRole: 'Mechanical Engineer',
      resumeKeywords: ['fluid mechanics', 'manufacturing', 'SolidWorks'],
    } as OnboardingResponse;
    const blueprint = getRoleBlueprint('Mechanical Engineer');
    const mix = { easy: 4, medium: 0, hard: 0, total: 4 };
    const firstPlan = internal.buildRoleFallbackTasks(
      profile,
      ['fluid mechanics', 'manufacturing'],
      undefined,
      mix,
      { easy: 0, medium: 0, hard: 0 },
      new Set(),
      0,
      new Set(),
      false,
      blueprint.dailyLanes,
    );
    const exhaustedTitles = new Set(
      firstPlan.map((task) => task.title.toLowerCase().trim()),
    );
    const priorProfessionTitles = new Set(exhaustedTitles);
    const repairedPlan = internal.buildRoleFallbackTasks(
      profile,
      ['fluid mechanics', 'manufacturing'],
      undefined,
      mix,
      { easy: 0, medium: 0, hard: 0 },
      new Set(exhaustedTitles),
      0,
      new Set(),
      false,
      blueprint.dailyLanes,
    );

    expect(repairedPlan).toHaveLength(4);
    expect(
      repairedPlan.every(
        (task) => !priorProfessionTitles.has(task.title.toLowerCase().trim()),
      ),
    ).toBe(true);
    expect(() =>
      internal.assertFinalPlanRequirements(
        repairedPlan,
        mix,
        false,
        new Set(),
        blueprint.dailyLanes.map((lane) =>
          lane.category.toLowerCase().replace(/[^a-z0-9]+/g, ' '),
        ),
        priorProfessionTitles,
      ),
    ).not.toThrow();
  });
  // T: O(n) and S: O(n), where n is the number of daily fallback lanes
});
