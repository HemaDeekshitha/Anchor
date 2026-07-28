import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { RagTask } from './rag-task.entity';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { UserSkill } from '../skills/user-skills.entity';
import { UserSeenTask } from './user-seen-task.entity';
import { normalizeLeetcodeUrl } from './leetcode-url.util';
import {
  BlueprintDailyLane,
  getRoleBlueprint,
} from '../learning-tracks/role-blueprints';

type Diff = 'easy' | 'medium' | 'hard';

const SYSTEM_DESIGN_FALLBACKS = [
  'Design a notification delivery system. Which functional and non-functional requirements would you clarify, how would you define the APIs and data model, and how would you handle retries, idempotency, fan-out, and delivery bottlenecks?',
  'Design a URL shortening service. Estimate read and write traffic, define the redirect and creation APIs, choose a short-code strategy and data model, and explain how caching and replication affect reliability?',
  'Design a distributed rate limiter. Clarify the enforcement scope and consistency requirements, choose an algorithm and storage layer, and explain how you would handle hot keys, failures, and multi-region traffic?',
  'Design a real-time chat service. How would you clarify delivery guarantees, model conversations and messages, manage persistent connections, and handle ordering, offline users, and fan-out at scale?',
  'Design a news-feed service. Which product requirements drive push versus pull fan-out, how would you model and rank feed items, and where would caching, queues, and backpressure be required?',
  'A read-heavy API is missing its latency target. How would you decide what to cache, choose cache keys and TTLs, prevent stampedes, invalidate stale data, and measure whether Redis actually fixes the bottleneck?',
  'A relational database is approaching its write limit. What evidence would justify sharding, how would you choose a shard key, and how would you handle rebalancing, hot partitions, joins, and cross-shard transactions?',
  'Design an event-driven order pipeline with Kafka. How would you define partitions and consumer groups, preserve required ordering, handle retries and poison messages, and make downstream processing idempotent?',
  'Design product search using Elasticsearch. How would you model and index documents, keep the index synchronized with the source of truth, support ranking and filters, and recover from stale or failed indexing?',
  'For a globally distributed service, how would CAP trade-offs, consistent hashing, replication, and quorum choices change when the product prioritizes availability over strongly consistent reads?',
];

const BEHAVIORAL_FALLBACKS = [
  'Tell me about a time you disagreed with a technical decision. How did you gather evidence, communicate the trade-offs, and support the final decision?',
  'Tell me about a production incident you helped resolve. What did you personally do during mitigation, how did you find the root cause, and what changed afterward?',
  'Tell me about a time requirements were ambiguous. Which questions did you ask, how did you align stakeholders, and how did you prevent rework?',
  'Tell me about a time you missed or were at risk of missing a commitment. How did you communicate it, re-scope the work, and rebuild trust?',
  'Tell me about a time you received difficult technical feedback. How did you evaluate it, what did you change, and what was the result?',
  'Tell me about a time you improved code or a process outside your assigned work. How did you establish that the change was worthwhile and gain adoption?',
  'Tell me about a conflict between delivery speed and engineering quality. Which risks did you accept, which safeguards did you require, and what was the outcome?',
  'Tell me about a time you mentored or unblocked a teammate. How did you diagnose what they needed without simply solving the problem for them?',
];

const SOFTWARE_CORE_FALLBACKS: Array<{
  category: string;
  anchor: string;
  title: string;
}> = [
  {
    category: 'Databases',
    anchor: 'database indexing and query planning',
    title:
      'A query became slow after a table grew from thousands to millions of rows. How would you use the query plan to diagnose it, choose an index, and verify that the index improves the workload without unacceptable write overhead?',
  },
  {
    category: 'Networking',
    anchor: 'networking and request latency',
    title:
      'An API has intermittent high latency but normal application CPU and database time. How would you investigate DNS, connection establishment, TLS, load balancing, retransmissions, and upstream timeouts to isolate the network bottleneck?',
  },
  {
    category: 'Testing & Reliability',
    anchor: 'testing and reliability',
    title:
      'A service passes unit tests but fails under production traffic. How would you redesign the test strategy across integration, contract, load, and failure-injection testing, and which signals would determine release readiness?',
  },
  {
    category: 'Programming & Code Quality',
    anchor: 'concurrency and correctness',
    title:
      'Two requests can update the same record concurrently and occasionally lose data. Walk through the race condition and compare transactions, optimistic locking, pessimistic locking, and idempotency as possible fixes?',
  },
  {
    category: 'Cloud & DevOps',
    anchor: 'deployment and observability',
    title:
      'A new deployment increases p95 latency without increasing the error rate. How would you use metrics, traces, logs, feature flags, and rollback criteria to identify and contain the regression?',
  },
];

const PROFESSIONAL_LANE_FALLBACKS: Record<string, Record<string, string[]>> = {
  'business-analyst': {
    'business analysis foundations': [
      'A stakeholder asks for a dashboard to improve order-fulfillment performance. How would you identify the decisions it must support, define KPIs and acceptance criteria, validate the source data, and prevent misleading metrics?',
      'A team reports that a business process is slow but has no reliable baseline. How would you map the current process, define cycle-time and quality measures, identify root causes, and validate that a proposed change creates value?',
    ],
    'business case stakeholders': [
      'Sales wants a feature immediately while operations says it will create unacceptable manual work. How would you elicit the underlying needs, model impact, resolve conflicting requirements, and recommend a priority?',
      'A sponsor proposes automating an approval process. Which questions would you ask about users, exceptions, controls, data, cost, and success measures before recommending a solution?',
    ],
    'behavioral leadership': [
      'Tell me about a time you influenced stakeholders without formal authority. How did you establish credibility, handle disagreement, and measure whether alignment led to a better outcome?',
    ],
  },
  'electrical-engineer': {
    'electrical engineering fundamentals': [
      'A 5 V power rail shows excessive ripple only when a motor starts. How would you reason about the likely causes, choose measurements and probe setup, and distinguish supply, grounding, decoupling, and load-transient problems?',
      'An ADC reading is noisy and occasionally saturates. How would you evaluate signal range, reference stability, sampling, aliasing, grounding, filtering, and quantization before changing the design?',
    ],
    'design test troubleshooting': [
      'Design the interface between a noisy industrial sensor and a microcontroller. Which electrical, accuracy, bandwidth, isolation, protection, calibration, and test constraints would you clarify before selecting the circuit?',
      'A prototype passes bench testing but fails intermittently after thermal cycling. How would you build a fault-isolation plan, select instrumentation, reproduce the failure, and prove the corrective action?',
    ],
    'behavioral safety judgment': [
      'Tell me about a time schedule pressure conflicted with a safety, compliance, or validation concern. What evidence did you raise, how did you communicate risk, and what decision was made?',
    ],
  },
  lawyer: {
    'legal analysis authority': [
      'A client describes a commercial dispute with an incomplete timeline and an ambiguous contract clause. How would you identify the legal issues, determine controlling authority, separate missing facts from assumptions, and evaluate the strongest counterargument?',
      'Two authorities appear to support conflicting outcomes for your client. How would you assess hierarchy, jurisdiction, factual similarity, subsequent treatment, and policy before advising on the likely result?',
    ],
    'case strategy client advice': [
      'A client wants to file immediately, but key documents and witness accounts are incomplete. How would you structure the investigation, preserve evidence, assess claims and defenses, and explain timing, cost, and settlement risk?',
      'During negotiation, opposing counsel offers a favorable headline term with broad release language. How would you analyze the hidden risks, clarify client priorities, and propose revisions or fallback positions?',
    ],
    'ethics professional judgment': [
      'A client asks you to omit a fact that materially weakens their position. How would you analyze your duties, advise the client, document the conversation, and decide whether continued representation is appropriate?',
    ],
  },
};

const LEETCODE_FALLBACKS: Record<
  Diff,
  Array<{ title: string; url: string; topic: string }>
> = {
  easy: [
    {
      title: 'Solve Two Sum and explain the time and space complexity.',
      url: 'https://leetcode.com/problems/two-sum/',
      topic: 'hash maps',
    },
    {
      title: 'Solve Valid Parentheses and explain why a stack is appropriate.',
      url: 'https://leetcode.com/problems/valid-parentheses/',
      topic: 'stacks',
    },
    {
      title: 'Solve Binary Search and explain the loop invariants.',
      url: 'https://leetcode.com/problems/binary-search/',
      topic: 'binary search',
    },
    {
      title:
        'Solve Best Time to Buy and Sell Stock and explain the one-pass approach.',
      url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
      topic: 'arrays',
    },
    {
      title: 'Solve Merge Two Sorted Lists and explain the pointer updates.',
      url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
      topic: 'linked lists',
    },
  ],
  medium: [
    {
      title:
        'Solve Group Anagrams and explain how you construct a stable grouping key.',
      url: 'https://leetcode.com/problems/group-anagrams/',
      topic: 'hash maps and strings',
    },
    {
      title:
        'Solve Longest Substring Without Repeating Characters using a sliding window.',
      url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      topic: 'sliding window',
    },
    {
      title:
        'Solve Number of Islands and compare depth-first and breadth-first traversal.',
      url: 'https://leetcode.com/problems/number-of-islands/',
      topic: 'graph traversal',
    },
    {
      title:
        'Solve Course Schedule and explain how cycle detection determines the result.',
      url: 'https://leetcode.com/problems/course-schedule/',
      topic: 'graphs and topological sorting',
    },
    {
      title:
        'Solve Merge Intervals and explain why sorting enables the merge step.',
      url: 'https://leetcode.com/problems/merge-intervals/',
      topic: 'intervals and sorting',
    },
  ],
  hard: [
    {
      title:
        'Solve Trapping Rain Water and compare the two-pointer and stack approaches.',
      url: 'https://leetcode.com/problems/trapping-rain-water/',
      topic: 'two pointers',
    },
    {
      title:
        'Solve Merge k Sorted Lists and explain the heap-based complexity.',
      url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
      topic: 'heaps and linked lists',
    },
    {
      title:
        'Solve Minimum Window Substring and explain how the window validity is maintained.',
      url: 'https://leetcode.com/problems/minimum-window-substring/',
      topic: 'sliding window',
    },
    {
      title:
        'Solve Word Ladder and explain why breadth-first search finds the shortest sequence.',
      url: 'https://leetcode.com/problems/word-ladder/',
      topic: 'breadth-first search',
    },
    {
      title:
        'Solve Median of Two Sorted Arrays and explain the partition invariant.',
      url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
      topic: 'binary search and partitioning',
    },
  ],
};

interface GeneratedTaskDto {
  title: string;
  description?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  time_minutes: number;
  leetcodeUrl?: string;
  sourceKeywords?: string[];
  sourceResumePoint?: string | null;
  selectionReason?: string;
}

export interface CurriculumContext {
  durationMonths: number;
  week: number;
  totalWeeks: number;
  phase: string;
  focus: string[];
  milestone: string;
}

interface TaskProvider {
  name: string;
  type: 'openai-compat' | 'gemini';
  baseURL?: string;
  apiKeyEnv: string;
  model: string;
}

const TASK_PROVIDERS: TaskProvider[] = [
  {
    name: 'groq',
    type: 'openai-compat',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKeyEnv: 'GROQ_API_KEY',
    model: 'llama-3.3-70b-versatile',
  },
  {
    name: 'openrouter',
    type: 'openai-compat',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    model: 'openai/gpt-oss-120b:free',
  },
  {
    name: 'gemini-2.5',
    type: 'gemini',
    apiKeyEnv: 'GEMINI_API_KEY',
    model: 'gemini-2.5-flash',
  },
  {
    name: 'gemini-lite',
    type: 'gemini',
    apiKeyEnv: 'GEMINI_API_KEY',
    model: 'gemini-2.5-flash-lite',
  },
];

@Injectable()
export class TaskGenerationService {
  private readonly logger = new Logger(TaskGenerationService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(RagTask)
    private readonly ragTaskRepo: Repository<RagTask>,

    @InjectRepository(OnboardingResponse)
    private readonly onboardingRepo: Repository<OnboardingResponse>,

    @InjectRepository(UserSkill)
    private readonly userSkillRepo: Repository<UserSkill>,

    @InjectRepository(UserSeenTask)
    private readonly userSeenTaskRepo: Repository<UserSeenTask>,

    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async callGeminiWithFallback(prompt: string): Promise<string | null> {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const selected =
      this.configService.get<string>('TASK_PROVIDER') ?? 'gemini-2.5';

    const provider = TASK_PROVIDERS.find((p) => p.name === selected);
    if (!provider) {
      this.logger.warn(`Unknown TASK_PROVIDER: ${selected}`);
      return null;
    }

    const apiKey = this.configService.get<string>(provider.apiKeyEnv);
    if (!apiKey) {
      this.logger.warn(`API key missing for TASK_PROVIDER: ${selected}`);
      return null;
    }

    this.logger.log(`🤖 Task generation using provider: ${provider.name}`);

    let attempt = 0;
    while (attempt < 2) {
      attempt++;
      try {
        if (provider.type === 'openai-compat') {
          const client = new OpenAI({ apiKey, baseURL: provider.baseURL });
          const response = await client.chat.completions.create({
            model: provider.model,
            max_tokens: 2000,
            temperature: 0.7,
            messages: [{ role: 'user', content: prompt }],
          });
          const text = response.choices[0]?.message?.content?.trim() ?? '';
          if (!text) throw new Error('Empty response from provider');
          this.logger.log(`✅ Used model: ${provider.name}`);
          return text;
        }

        if (provider.type === 'gemini') {
          const model = this.genAI.getGenerativeModel({
            model: provider.model,
          });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          this.logger.log(`✅ Used model: ${provider.name}`);
          return text;
        }
      } catch (err: any) {
        const status: number = err?.status ?? err?.code ?? 0;
        const msg: string = err?.message ?? String(err);

        const isOverload =
          status === 503 || /overloaded|high demand/i.test(msg);
        const isQuotaOrAuth =
          status === 429 || status === 403 || /quota|depleted/i.test(msg);

        if (isOverload && attempt === 1) {
          this.logger.warn(`⚠️ ${provider.name} overloaded — retrying in 8s…`);
          await sleep(8000);
          continue;
        }

        if (isQuotaOrAuth) {
          this.logger.warn(
            `⚠️ ${provider.name} quota/auth error (${status}) — skipping`,
          );
        } else {
          this.logger.warn(
            `⚠️ ${provider.name} failed (${status}: ${msg.slice(0, 120)})`,
          );
        }
        break;
      }
    }

    this.logger.warn(`Task generation failed for provider: ${selected}`);
    return null;
  }

  async generateTasksForToday(
    userId: string,
    mix: { easy: number; medium: number; hard: number; total: number },
    curriculum?: CurriculumContext,
  ): Promise<RagTask[]> {
    const profile = await this.onboardingRepo.findOne({ where: { userId } });
    const userSkills = await this.userSkillRepo.find({ where: { userId } });
    const skillNames = userSkills.map((s) => s.skillName);

    const role =
      profile?.dedicatedRole?.trim() ||
      profile?.preferredRole?.[0]?.trim() ||
      null;

    if (!role) {
      this.logger.warn(`Skipping generation for ${userId}: missing role`);
      return [];
    }

    const seenRows = await this.userSeenTaskRepo.find({
      where: { user_id: userId },
    });
    const seenKeys = new Set(seenRows.map((r) => r.title_key));
    const seenTitles = seenRows.map((r) => r.title_key);
    const softwareRole = this.isSoftwareRole(role);
    const roleBlueprint = getRoleBlueprint(role);
    const requiredDailyCategories = new Set(
      (softwareRole
        ? ['DSA', 'System Design', 'Behavioral', 'Resume & Project Deep-Dive']
        : roleBlueprint.dailyLanes.map((lane) => lane.category)
      ).map((category) => this.normaliseCategory(category)),
    );
    const seenLeetcodeUrls = softwareRole
      ? await this.getSeenLeetcodeUrls(userId)
      : new Set<string>();
    const requiredLeetcodeDifficulty = softwareRole
      ? this.leetcodeDifficulty(mix)
      : null;

    const prompt = this.buildDailyPrompt(
      profile,
      skillNames,
      mix,
      seenTitles,
      curriculum,
      [...seenLeetcodeUrls],
    );

    this.logger.log(
      `🎯 Role: ${profile?.dedicatedRole ?? profile?.preferredRole?.[0]}`,
    );
    this.logger.log(
      `🔑 Keywords (${(profile?.resumeKeywords ?? skillNames).length}): ${(profile?.resumeKeywords ?? skillNames).join(', ')}`,
    );
    this.logger.log(`📚 Interests: ${profile?.areasOfInterest?.join(', ')}`);

    const fresh: GeneratedTaskDto[] = [];
    const reserve: GeneratedTaskDto[] = [];
    const candidateKeys = new Set<string>();
    const usedAnchors = new Set<string>();
    const usedCategories = new Set<string>();
    const acceptedByDifficulty = { easy: 0, medium: 0, hard: 0 };
    let acceptedLeetcodeUrl: string | null = null;

    for (let attempt = 0; attempt < 3 && fresh.length < mix.total; attempt++) {
      const remainingMix = {
        easy: mix.easy - acceptedByDifficulty.easy,
        medium: mix.medium - acceptedByDifficulty.medium,
        hard: mix.hard - acceptedByDifficulty.hard,
        total: mix.total - fresh.length,
      };
      const attemptPrompt =
        attempt === 0
          ? prompt
          : `${prompt}\n\nREPAIR ATTEMPT ${attempt + 1}: Previous output did not provide enough valid, distinct questions. Generate ONLY ${remainingMix.total} replacements: ${remainingMix.easy} easy, ${remainingMix.medium} medium, ${remainingMix.hard} hard. Do not use these anchors again: ${[...usedAnchors].join(', ')}. Every replacement must pass all quality rules and include provenance fields.`;
      const text = await this.callGeminiWithFallback(attemptPrompt);
      // A provider outage cannot be repaired by sending the same request two
      // more times. Fall through to the deterministic local plan immediately.
      if (!text) break;
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) continue;

      let candidates: GeneratedTaskDto[] = [];
      try {
        candidates = JSON.parse(match[0]) as GeneratedTaskDto[];
      } catch {
        this.logger.warn('Failed to parse LLM JSON response');
        continue;
      }

      for (const rawTask of candidates) {
        if (!rawTask.title) continue;
        const normalizedLeetcodeUrl = normalizeLeetcodeUrl(rawTask.leetcodeUrl);
        const isLeetcode = softwareRole && Boolean(normalizedLeetcodeUrl);
        const task: GeneratedTaskDto = {
          ...rawTask,
          category: softwareRole
            ? isLeetcode
              ? 'DSA'
              : this.softwareCategoryForTask(rawTask)
            : this.professionalCategoryForTask(
                rawTask,
                roleBlueprint.dailyLanes,
              ),
          leetcodeUrl: isLeetcode ? normalizedLeetcodeUrl! : undefined,
        };
        const titleKey = this.normaliseTitle(task.title);
        if (seenKeys.has(titleKey) || candidateKeys.has(titleKey)) continue;
        const difficulty = this.sanitiseDifficulty(task.difficulty);
        if (!softwareRole && normalizedLeetcodeUrl) continue;
        if (
          isLeetcode &&
          (acceptedLeetcodeUrl ||
            difficulty !== requiredLeetcodeDifficulty ||
            seenLeetcodeUrls.has(normalizedLeetcodeUrl!))
        ) {
          continue;
        }
        const categoryKey = this.normaliseCategory(task.category);
        if (!categoryKey || usedCategories.has(categoryKey)) continue;
        if (!requiredDailyCategories.has(categoryKey)) {
          const missingRequired = [...requiredDailyCategories].filter(
            (category) => !usedCategories.has(category),
          ).length;
          if (mix.total - fresh.length <= missingRequired) continue;
        }
        if (!this.isHighQualityTask(task, profile, curriculum, skillNames))
          continue;
        const primaryAnchor =
          this.taskSources(task)[0]?.toLowerCase() ??
          task.sourceResumePoint?.trim().toLowerCase();
        if (!primaryAnchor || usedAnchors.has(primaryAnchor)) continue;
        candidateKeys.add(titleKey);
        reserve.push(task);
        const reservedLeetcodeSlot =
          softwareRole &&
          !acceptedLeetcodeUrl &&
          !isLeetcode &&
          difficulty === requiredLeetcodeDifficulty
            ? 1
            : 0;
        if (
          acceptedByDifficulty[difficulty] >=
          mix[difficulty] - reservedLeetcodeSlot
        ) {
          continue;
        }
        usedAnchors.add(primaryAnchor);
        usedCategories.add(categoryKey);
        seenKeys.add(titleKey);
        acceptedByDifficulty[difficulty]++;
        if (isLeetcode) acceptedLeetcodeUrl = normalizedLeetcodeUrl!;
        fresh.push(task);
        if (fresh.length >= mix.total) break;
      }
    }

    // Keep the exact difficulty/topic spread as the first choice. If the model
    // produced enough sound questions but repeated a primary topic or missed a
    // difficulty quota, use those vetted questions rather than throwing away
    // the entire day. Difficulty is normalized to the remaining requested mix.
    if (fresh.length < mix.total) {
      const freshKeys = new Set(
        fresh.map((task) => this.normaliseTitle(task.title)),
      );
      for (const task of reserve) {
        const titleKey = this.normaliseTitle(task.title);
        if (freshKeys.has(titleKey)) continue;
        const normalizedLeetcodeUrl = normalizeLeetcodeUrl(task.leetcodeUrl);
        const isLeetcode = softwareRole && Boolean(normalizedLeetcodeUrl);
        if (
          isLeetcode &&
          (acceptedLeetcodeUrl ||
            seenLeetcodeUrls.has(normalizedLeetcodeUrl!) ||
            this.sanitiseDifficulty(task.difficulty) !==
              requiredLeetcodeDifficulty)
        ) {
          continue;
        }
        const categoryKey = this.normaliseCategory(task.category);
        const primaryAnchor =
          this.taskSources(task)[0]?.toLowerCase() ??
          task.sourceResumePoint?.trim().toLowerCase();
        if (
          !categoryKey ||
          usedCategories.has(categoryKey) ||
          !primaryAnchor ||
          usedAnchors.has(primaryAnchor)
        ) {
          continue;
        }
        if (!requiredDailyCategories.has(categoryKey)) {
          const missingRequired = [...requiredDailyCategories].filter(
            (category) => !usedCategories.has(category),
          ).length;
          if (mix.total - fresh.length <= missingRequired) continue;
        }
        const neededDifficulty =
          isLeetcode && requiredLeetcodeDifficulty
            ? acceptedByDifficulty[requiredLeetcodeDifficulty] <
              mix[requiredLeetcodeDifficulty]
              ? requiredLeetcodeDifficulty
              : undefined
            : (['easy', 'medium', 'hard'] as const).find((difficulty) => {
                const reservedLeetcodeSlot =
                  softwareRole &&
                  !acceptedLeetcodeUrl &&
                  difficulty === requiredLeetcodeDifficulty
                    ? 1
                    : 0;
                return (
                  acceptedByDifficulty[difficulty] <
                  mix[difficulty] - reservedLeetcodeSlot
                );
              });
        if (!neededDifficulty) break;
        fresh.push({ ...task, difficulty: neededDifficulty });
        freshKeys.add(titleKey);
        seenKeys.add(titleKey);
        usedAnchors.add(primaryAnchor);
        usedCategories.add(categoryKey);
        acceptedByDifficulty[neededDifficulty]++;
        if (isLeetcode) acceptedLeetcodeUrl = normalizedLeetcodeUrl!;
        if (fresh.length >= mix.total) break;
      }
    }

    if (softwareRole && !acceptedLeetcodeUrl && requiredLeetcodeDifficulty) {
      const leetcodeTask = this.buildLeetcodeFallbackTask(
        requiredLeetcodeDifficulty,
        seenLeetcodeUrls,
        seenKeys,
      );
      if (!leetcodeTask) {
        throw new Error(
          'Unable to select a unique daily LeetCode problem for this user',
        );
      }
      fresh.push(leetcodeTask);
      acceptedByDifficulty[requiredLeetcodeDifficulty]++;
      acceptedLeetcodeUrl = leetcodeTask.leetcodeUrl!;
      usedCategories.add(this.normaliseCategory(leetcodeTask.category));
      usedAnchors.add(this.taskSources(leetcodeTask)[0].toLowerCase());
      seenKeys.add(this.normaliseTitle(leetcodeTask.title));
    }

    if (fresh.length < mix.total) {
      const fallbacks = this.buildRoleFallbackTasks(
        profile,
        skillNames,
        curriculum,
        mix,
        acceptedByDifficulty,
        seenKeys,
        fresh.length,
        usedCategories,
        softwareRole,
        roleBlueprint.dailyLanes,
      );
      fresh.push(...fallbacks);
    }

    if (fresh.length !== mix.total) {
      this.logger.error(
        `Unable to assemble a complete, varied daily plan for ${userId} (${fresh.length}/${mix.total} tasks).`,
      );
      throw new Error('Unable to assemble the complete daily Smart Plan');
    }

    this.assertFinalPlanRequirements(
      fresh,
      mix,
      softwareRole,
      seenLeetcodeUrls,
      [...requiredDailyCategories],
    );

    const toSave = fresh.map((t) =>
      this.ragTaskRepo.create({
        title: t.title,
        description: t.description ?? null,
        category: t.category || 'Technical Concepts',
        difficulty: this.sanitiseDifficulty(t.difficulty),
        priority: this.difficultyToPriority(t.difficulty),
        tags: Array.isArray(t.tags) ? t.tags.slice(0, 5) : [],
        time_minutes: t.time_minutes ?? 25,
        leetcodeUrl: normalizeLeetcodeUrl(t.leetcodeUrl),
        source_keywords: this.taskSources(t),
        source_resume_point: t.sourceResumePoint?.trim() || null,
        selection_reason:
          t.selectionReason?.trim() ||
          (curriculum
            ? `Required for ${curriculum.phase}`
            : 'Target-role preparation'),
        user_id: userId,
        is_active: true,
      }),
    );

    const saved = await this.ragTaskRepo.save(toSave);

    const seenEntries = saved.map((task) =>
      this.userSeenTaskRepo.create({
        user_id: userId,
        task_id: task.id,
        title_key: this.normaliseTitle(task.title),
      }),
    );

    await this.userSeenTaskRepo
      .createQueryBuilder()
      .insert()
      .into(UserSeenTask)
      .values(seenEntries)
      .orIgnore()
      .execute();

    this.logger.log(
      `Saved ${saved.length} tasks for user ${userId} (mix: easy=${mix.easy} med=${mix.medium} hard=${mix.hard})`,
    );
    return saved;
  }

  private normaliseTitle(title: string): string {
    return title.toLowerCase().trim();
  }

  private normaliseCategory(category: string | undefined): string {
    return (
      category
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ') ?? ''
    );
  }

  private assertFinalPlanRequirements(
    tasks: GeneratedTaskDto[],
    mix: { easy: number; medium: number; hard: number; total: number },
    softwareRole: boolean,
    seenLeetcodeUrls: Set<string>,
    requiredCategories: string[],
  ): void {
    const categories = tasks.map((task) =>
      this.normaliseCategory(task.category),
    );
    if (
      categories.some((category) => !category) ||
      new Set(categories).size !== tasks.length
    ) {
      throw new Error('Daily Smart Plan categories must all be distinct');
    }

    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    for (const task of tasks) {
      difficultyCounts[this.sanitiseDifficulty(task.difficulty)]++;
    }
    if (
      difficultyCounts.easy !== mix.easy ||
      difficultyCounts.medium !== mix.medium ||
      difficultyCounts.hard !== mix.hard
    ) {
      throw new Error('Daily Smart Plan difficulty mix is invalid');
    }

    const leetcodeTasks = tasks.filter((task) =>
      Boolean(normalizeLeetcodeUrl(task.leetcodeUrl)),
    );
    const leetcodeUrls = leetcodeTasks.map(
      (task) => normalizeLeetcodeUrl(task.leetcodeUrl)!,
    );
    if (softwareRole) {
      if (
        leetcodeUrls.length !== 1 ||
        seenLeetcodeUrls.has(leetcodeUrls[0]) ||
        leetcodeTasks[0].category !== 'DSA' ||
        this.sanitiseDifficulty(leetcodeTasks[0].difficulty) !==
          this.leetcodeDifficulty(mix) ||
        mix.total < requiredCategories.length ||
        requiredCategories.some((category) => !categories.includes(category))
      ) {
        throw new Error(
          'Software-role plans require LeetCode, system design, behavioral, and resume deep-dive lanes',
        );
      }
    } else if (leetcodeUrls.length > 0) {
      throw new Error('Non-software plans cannot contain LeetCode problems');
    }

    if (
      mix.total < requiredCategories.length ||
      requiredCategories.some((category) => !categories.includes(category))
    ) {
      const missingCategories = requiredCategories.filter(
        (category) => !categories.includes(category),
      );
      throw new Error(
        `Daily Smart Plan is missing required profession-specific interview lanes: ${missingCategories.join(', ')}`,
      );
    }
  }

  private async getSeenLeetcodeUrls(userId: string): Promise<Set<string>> {
    const rows = await this.ragTaskRepo
      .createQueryBuilder('task')
      .select('task.leetcodeUrl', 'leetcodeUrl')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.leetcodeUrl IS NOT NULL')
      .getRawMany<{ leetcodeUrl: string }>();

    return new Set(
      rows
        .map((row) => normalizeLeetcodeUrl(row.leetcodeUrl))
        .filter((url): url is string => Boolean(url)),
    );
  }

  private buildLeetcodeFallbackTask(
    difficulty: Diff,
    seenUrls: Set<string>,
    seenTitles: Set<string>,
  ): GeneratedTaskDto | null {
    const problem = LEETCODE_FALLBACKS[difficulty].find(
      (candidate) =>
        !seenUrls.has(candidate.url) &&
        !seenTitles.has(this.normaliseTitle(candidate.title)),
    );
    if (!problem) return null;

    return {
      title: problem.title,
      description:
        'Solve the problem, explain the chosen data structure and algorithm, analyze time and space complexity, and discuss important edge cases.',
      category: 'DSA',
      difficulty,
      priority: this.difficultyToPriority(difficulty),
      tags: ['LeetCode', problem.topic],
      time_minutes: 30,
      leetcodeUrl: problem.url,
      sourceKeywords: [problem.topic],
      sourceResumePoint: null,
      selectionReason: 'Daily coding interview practice',
    };
  }

  private professionalCategoryForTask(
    task: GeneratedTaskDto,
    lanes: BlueprintDailyLane[],
  ): string {
    const declared = this.normaliseCategory(task.category);
    const exact = lanes.find(
      (lane) => this.normaliseCategory(lane.category) === declared,
    );
    if (exact) return exact.category;

    if (task.sourceResumePoint?.trim()) {
      const resumeLane = lanes.find((lane) =>
        /resume|experience|project|matter/.test(
          this.normaliseCategory(lane.category),
        ),
      );
      if (resumeLane) return resumeLane.category;
    }

    const behavioralText = `${task.category} ${task.title}`.toLowerCase();
    if (
      /\btell me about a time|behavior|leadership|professional judgment\b/.test(
        behavioralText,
      )
    ) {
      const behavioralLane = lanes.find((lane) =>
        /behavior|judgment|leadership|ethics/.test(
          this.normaliseCategory(lane.category),
        ),
      );
      if (behavioralLane) return behavioralLane.category;
    }

    const declaredWords = new Set(declared.split(' ').filter(Boolean));
    const closest = lanes
      .map((lane) => ({
        lane,
        overlap: this.normaliseCategory(lane.category)
          .split(' ')
          .filter((word) => declaredWords.has(word)).length,
      }))
      .sort((left, right) => right.overlap - left.overlap)[0];
    return closest?.overlap > 0 ? closest.lane.category : task.category;
  }

  private softwareCategoryForTask(task: GeneratedTaskDto): string {
    const declaredCategory = this.normaliseCategory(task.category);
    if (declaredCategory === 'behavioral') return 'Behavioral';
    if (declaredCategory === 'system design') return 'System Design';
    if (
      declaredCategory === 'resume project deep dive' ||
      declaredCategory === 'resume projects technical decisions'
    ) {
      return 'Resume & Project Deep-Dive';
    }

    const text = [
      task.category,
      task.title,
      ...(task.sourceKeywords ?? []),
      ...(task.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (
      /\bbehavior|teamwork|conflict|leadership|stakeholder|collaborat/.test(
        text,
      )
    ) {
      return 'Behavioral';
    }
    if (
      /\bsystem design|architecture|scalab|rate limit|distributed|microservice/.test(
        text,
      )
    ) {
      return 'System Design';
    }
    if (
      /\bdatabase|sql|postgres|mysql|mongo|redis|elastic|index|transaction|acid\b/.test(
        text,
      )
    ) {
      return 'Databases';
    }
    if (/\bnetwork|tcp|udp|http|https|dns|socket|websocket\b/.test(text)) {
      return 'Networking';
    }
    if (
      /\boperating system|process|thread|concurr|parallel|memory|deadlock|mutex|semaphore\b/.test(
        text,
      )
    ) {
      return 'Operating Systems & Concurrency';
    }
    if (
      /\btest|testing|jest|cypress|playwright|selenium|unit test|integration test\b/.test(
        text,
      )
    ) {
      return 'Testing & Quality';
    }
    if (
      /\baws|azure|gcp|cloud|docker|kubernetes|terraform|jenkins|ci\/cd|devops|deployment\b/.test(
        text,
      )
    ) {
      return 'Cloud & DevOps';
    }
    if (
      /\breact|angular|vue|next\.?js|frontend|css|html|browser\b/.test(text)
    ) {
      return 'Frontend Engineering';
    }
    if (
      /\bnode|express|nest|spring|django|flask|fastapi|backend|api|graphql|grpc\b/.test(
        text,
      )
    ) {
      return 'Backend & APIs';
    }
    if (/\bproject|resume|built|implemented|developed|delivered\b/.test(text)) {
      return 'Resume & Project Deep-Dive';
    }
    return 'Programming & Code Quality';
  }

  private buildRoleFallbackTasks(
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
  ): GeneratedTaskDto[] {
    if (!softwareRole) {
      return this.buildProfessionalFallbackTasks(
        profile,
        skills,
        curriculum,
        mix,
        accepted,
        seenKeys,
        alreadyGenerated,
        usedCategories,
        dailyLanes,
      );
    }
    const needed = Math.max(0, mix.total - alreadyGenerated);
    const output: GeneratedTaskDto[] = [];
    const remaining = {
      easy: Math.max(0, mix.easy - accepted.easy),
      medium: Math.max(0, mix.medium - accepted.medium),
      hard: Math.max(0, mix.hard - accepted.hard),
    };

    const takeDifficulty = (preference: Diff[]): Diff | null => {
      return preference.find((difficulty) => remaining[difficulty] > 0) ?? null;
    };

    const addTask = (
      category: string,
      title: string,
      anchor: string,
      preference: Diff[],
      description: string,
      sourceResumePoint: string | null = null,
    ) => {
      if (output.length >= needed) return;
      const categoryKey = this.normaliseCategory(category);
      const titleKey = this.normaliseTitle(title);
      const difficulty = takeDifficulty(preference);
      if (
        !difficulty ||
        usedCategories.has(categoryKey) ||
        seenKeys.has(titleKey)
      ) {
        return;
      }
      output.push({
        title,
        description,
        category,
        difficulty,
        priority: this.difficultyToPriority(difficulty),
        tags: [anchor],
        time_minutes: category === 'System Design' ? 40 : 25,
        leetcodeUrl: undefined,
        sourceKeywords: [anchor],
        sourceResumePoint,
        selectionReason: curriculum
          ? `Interview preparation for week ${curriculum.week}: ${curriculum.phase}`
          : 'Required software interview competency',
      });
      remaining[difficulty]--;
      seenKeys.add(titleKey);
      usedCategories.add(categoryKey);
    };

    if (!usedCategories.has(this.normaliseCategory('System Design'))) {
      const title = SYSTEM_DESIGN_FALLBACKS.find(
        (candidate) => !seenKeys.has(this.normaliseTitle(candidate)),
      );
      if (title) {
        addTask(
          'System Design',
          title,
          'system design delivery framework and trade-offs',
          ['hard', 'medium', 'easy'],
          'A strong answer should clarify requirements and constraints first, estimate scale where relevant, define APIs and data models, explain the high-level design, identify bottlenecks, and defend trade-offs.',
        );
      }
    }

    if (!usedCategories.has(this.normaliseCategory('Behavioral'))) {
      const title = BEHAVIORAL_FALLBACKS.find(
        (candidate) => !seenKeys.has(this.normaliseTitle(candidate)),
      );
      if (title) {
        addTask(
          'Behavioral',
          title,
          'behavioral evidence using STAR',
          ['easy', 'medium', 'hard'],
          'Use a specific STAR example. Make personal ownership, decisions, communication, measurable outcome, and learning explicit.',
        );
      }
    }

    if (
      !usedCategories.has(this.normaliseCategory('Resume & Project Deep-Dive'))
    ) {
      const evidencePoints = this.resumeEvidencePoints(profile);
      const resumeCandidates = evidencePoints.flatMap((point) => [
        `Your resume states, "${point}". What was the baseline, what did you personally change, how was the result measured, and what trade-offs did you make?`,
        `Regarding "${point}", what did you personally own, what was the hardest failure mode, and what evidence proved the solution worked?`,
      ]);
      if (resumeCandidates.length === 0 && skills.length > 0) {
        resumeCandidates.push(
          `Choose the project on your resume that best demonstrates ${skills[0]}. What did you personally build, why did you choose that approach, how did you validate it, and what would you redesign now?`,
        );
      }
      if (resumeCandidates.length === 0) {
        const role =
          profile?.dedicatedRole?.trim() ||
          profile?.preferredRole?.[0]?.trim() ||
          'your target role';
        resumeCandidates.push(
          `Which project best demonstrates your readiness for ${role}? Walk through the problem, your personal ownership, the implementation choices, the measurable result, and what you would improve now?`,
        );
      }
      const title = resumeCandidates.find(
        (candidate) =>
          candidate.length <= 260 &&
          !seenKeys.has(this.normaliseTitle(candidate)),
      );
      if (title) {
        const sourceResumePoint =
          evidencePoints.find((point) => title.includes(point)) ?? null;
        addTask(
          'Resume & Project Deep-Dive',
          title,
          sourceResumePoint ?? skills[0] ?? 'resume project',
          ['medium', 'hard', 'easy'],
          'A strong answer must defend the stated resume evidence with a baseline, personal contribution, technical choices, alternatives considered, measurement method, result, and lessons learned.',
          sourceResumePoint,
        );
      }
    }

    for (const candidate of SOFTWARE_CORE_FALLBACKS) {
      if (output.length >= needed) break;
      addTask(
        candidate.category,
        candidate.title,
        candidate.anchor,
        ['medium', 'easy', 'hard'],
        'A strong answer should form a concrete diagnosis or design, compare realistic alternatives, identify failure modes, and state how the decision would be validated in production.',
      );
    }

    if (output.length > 0) {
      this.logger.warn(
        `Filled ${output.length} software interview lane(s) with curated fallback questions.`,
      );
    }
    return output;
  }

  private buildProfessionalFallbackTasks(
    profile: OnboardingResponse | null,
    skills: string[],
    curriculum: CurriculumContext | undefined,
    mix: { easy: number; medium: number; hard: number; total: number },
    accepted: { easy: number; medium: number; hard: number },
    seenKeys: Set<string>,
    alreadyGenerated: number,
    usedCategories: Set<string>,
    dailyLanes: BlueprintDailyLane[],
  ): GeneratedTaskDto[] {
    const role =
      profile?.dedicatedRole?.trim() ||
      profile?.preferredRole?.[0]?.trim() ||
      'the target role';
    const blueprint = getRoleBlueprint(role);
    const needed = Math.max(0, mix.total - alreadyGenerated);
    const output: GeneratedTaskDto[] = [];
    const remaining = {
      easy: Math.max(0, mix.easy - accepted.easy),
      medium: Math.max(0, mix.medium - accepted.medium),
      hard: Math.max(0, mix.hard - accepted.hard),
    };
    const resumePoints = this.resumeEvidencePoints(profile);
    const anchors = [
      ...(curriculum?.focus ?? []),
      ...(profile?.resumeKeywords ?? []),
      ...skills,
      ...blueprint.competencies.map((competency) => competency.name),
    ].filter(Boolean);

    const nextDifficulty = (preference: Diff[]) =>
      preference.find((difficulty) => remaining[difficulty] > 0) ?? null;

    const addTask = (
      lane: BlueprintDailyLane,
      title: string,
      anchor: string,
      preference: Diff[],
      sourceResumePoint: string | null = null,
      allowPreviouslySeen = false,
    ) => {
      const difficulty = nextDifficulty(preference);
      const categoryKey = this.normaliseCategory(lane.category);
      const titleKey = this.normaliseTitle(title);
      if (
        !difficulty ||
        title.length > 260 ||
        (!allowPreviouslySeen && seenKeys.has(titleKey)) ||
        usedCategories.has(categoryKey) ||
        output.length >= needed
      ) {
        return;
      }
      output.push({
        title,
        description: `A strong answer should ${lane.objective.toLowerCase()} It must show a structured approach, profession-specific reasoning, explicit assumptions, alternatives, risks, and evidence of success.`,
        category: lane.category,
        difficulty,
        priority: this.difficultyToPriority(difficulty),
        tags: [anchor, role],
        time_minutes: 30,
        leetcodeUrl: undefined,
        sourceKeywords: [anchor],
        sourceResumePoint,
        selectionReason: curriculum
          ? `Required for week ${curriculum.week}: ${curriculum.phase}`
          : `Required interview lane for ${role}`,
      });
      remaining[difficulty]--;
      seenKeys.add(titleKey);
      usedCategories.add(categoryKey);
    };

    for (const [laneIndex, lane] of dailyLanes.entries()) {
      if (output.length >= needed) break;
      const categoryKey = this.normaliseCategory(lane.category);
      if (usedCategories.has(categoryKey)) continue;

      const isResumeLane = /resume|experience|project|matter/.test(categoryKey);
      const isBehavioralLane = /behavior|judgment|ethics|leadership/.test(
        categoryKey,
      );
      const isAppliedLane = /case|applied|design|troubleshoot|strategy/.test(
        categoryKey,
      );
      const preference: Diff[] = isBehavioralLane
        ? ['easy', 'medium', 'hard']
        : isAppliedLane
          ? ['hard', 'medium', 'easy']
          : ['medium', 'easy', 'hard'];

      if (isResumeLane) {
        const candidates = resumePoints.flatMap((point) => [
          `Your resume states, "${point}". What was the problem, what did you personally own, which methods or tools did you choose, how did you validate the result, and what would you improve now?`,
          `Regarding "${point}", which assumptions and alternatives did you consider, what evidence supported your decision, and how did you measure the outcome?`,
        ]);
        if (candidates.length === 0) {
          const skill = skills[0] ?? anchors[0] ?? role;
          candidates.push(
            `Which experience best demonstrates your ability with ${skill}? Walk through the context, your personal responsibility, the decisions you made, the evidence of success, and what you learned?`,
          );
        }
        const title = candidates.find(
          (candidate) =>
            candidate.length <= 260 &&
            !seenKeys.has(this.normaliseTitle(candidate)),
        );
        if (title) {
          const sourcePoint =
            resumePoints.find((point) => title.includes(point)) ?? null;
          addTask(
            lane,
            title,
            sourcePoint ?? skills[0] ?? role,
            ['medium', 'hard', 'easy'],
            sourcePoint,
          );
        }
        continue;
      }

      const curated =
        PROFESSIONAL_LANE_FALLBACKS[blueprint.slug]?.[categoryKey] ?? [];
      const anchor =
        anchors[laneIndex % Math.max(anchors.length, 1)] ??
        blueprint.competencies[laneIndex % blueprint.competencies.length]
          ?.name ??
        role;
      const genericCandidates = isBehavioralLane
        ? [
            `Tell me about a time you made a difficult professional decision involving ${anchor}. What evidence did you use, who was affected, how did you communicate the decision, and what was the result?`,
            `Tell me about a time incomplete information or competing stakeholder needs affected your work. How did you clarify the problem, decide what to do, and measure the outcome?`,
          ]
        : isAppliedLane
          ? [
              `You are given a high-stakes ${role} case involving ${anchor}, incomplete information, and competing constraints. What would you clarify first, how would you structure the analysis, and how would you defend and validate your recommendation?`,
            ]
          : [
              `An interviewer asks you to apply ${anchor} to a realistic ${role} problem. Which assumptions would you establish, how would you reason through the problem, and what evidence would validate your conclusion?`,
            ];
      const title = [...curated, ...genericCandidates].find(
        (candidate) =>
          candidate.length <= 260 &&
          !seenKeys.has(this.normaliseTitle(candidate)),
      );
      if (title) addTask(lane, title, anchor, preference);
    }

    // Exhausted title history must not remove a mandatory interview lane. As a
    // last-resort outage path, reuse a strong prompt for only the missing
    // category; a repeated question is safer than returning no plan at all.
    for (const [laneIndex, lane] of dailyLanes.entries()) {
      if (output.length >= needed) break;
      const categoryKey = this.normaliseCategory(lane.category);
      if (usedCategories.has(categoryKey)) continue;
      const anchor =
        anchors[laneIndex % Math.max(anchors.length, 1)] ??
        blueprint.competencies[laneIndex % blueprint.competencies.length]
          ?.name ??
        role;
      const title = `For a realistic ${role} interview case involving ${anchor}, how would you clarify the constraints, apply the relevant principles, compare alternatives, manage the main risks, and validate the result?`;
      addTask(
        lane,
        title,
        anchor,
        ['medium', 'easy', 'hard'],
        null,
        true,
      );
    }

    // Some profession blueprints intentionally define only three mandatory
    // lanes, while the adaptive plan can request four or five questions. Fill
    // those extra slots with distinct, role-specific practice categories so an
    // unavailable AI provider can never leave the user without today's plan.
    for (
      let supplementalIndex = 0;
      output.length < needed && supplementalIndex < mix.total;
      supplementalIndex++
    ) {
      const anchor =
        anchors[
          (dailyLanes.length + supplementalIndex) %
            Math.max(anchors.length, 1)
        ] ??
        blueprint.competencies[
          supplementalIndex % Math.max(blueprint.competencies.length, 1)
        ]?.name ??
        role;
      const lane: BlueprintDailyLane = {
        category: `Applied ${blueprint.title} Practice ${supplementalIndex + 1}`,
        objective:
          'apply a core competency to a realistic scenario and validate the recommendation with evidence.',
      };
      const title = `In a realistic ${role} situation involving ${anchor}, how would you clarify the goal, analyze the available evidence, compare alternatives, manage the main risks, and measure whether your recommendation succeeded?`;
      addTask(lane, title, anchor, ['medium', 'easy', 'hard']);
    }

    if (output.length > 0) {
      this.logger.warn(
        `Filled ${output.length} profession-specific interview lane(s) with evidence-based fallback questions.`,
      );
    }
    return output;
  }

  private resumeEvidencePoints(profile: OnboardingResponse | null): string[] {
    const text = profile?.resumeText?.trim();
    if (!text) return [];

    const points = text
      .split(/\n+|[•●▪◦]/)
      .map((point) => point.replace(/\s+/g, ' ').trim())
      .filter((point) => point.length >= 30)
      .map((point) =>
        point.length > 125 ? `${point.slice(0, 122).trim()}…` : point,
      );
    const evidencePattern =
      /\b(built|created|designed|developed|implemented|improved|reduced|increased|optimized|led|delivered|migrated|automated|scaled|\d+%|\d+x)\b/i;

    return [
      ...points.filter((point) => evidencePattern.test(point)),
      ...points.filter((point) => !evidencePattern.test(point)),
    ].slice(0, 8);
  }

  private taskSources(task: GeneratedTaskDto): string[] {
    const sources = Array.isArray(task.sourceKeywords)
      ? task.sourceKeywords
      : Array.isArray(task.tags)
        ? task.tags
        : [];
    return [
      ...new Set(
        sources.map((source) => String(source).trim()).filter(Boolean),
      ),
    ].slice(0, 4);
  }

  private isHighQualityTask(
    task: GeneratedTaskDto,
    profile: OnboardingResponse | null,
    curriculum?: CurriculumContext,
    skills: string[] = [],
  ): boolean {
    const title = task.title?.trim() ?? '';
    const isLeetcode =
      task.category === 'DSA' &&
      Boolean(normalizeLeetcodeUrl(task.leetcodeUrl));
    if (title.length < 15 || title.length > 260) return false;
    if (!isLeetcode && !title.endsWith('?')) return false;
    if (
      /^(tell me about yourself|what are your strengths|what are your weaknesses|why should we hire you)\??$/i.test(
        title,
      )
    ) {
      return false;
    }

    const sources = this.taskSources(task);
    if (sources.length === 0 && !task.sourceResumePoint?.trim()) return false;
    if (isLeetcode) return sources.length > 0;
    const categoryKey = this.normaliseCategory(task.category);
    if (/resume|experience|project|matter/.test(categoryKey)) {
      return Boolean(task.sourceResumePoint?.trim());
    }
    if (/behavior|judgment|ethics|leadership/.test(categoryKey)) {
      return sources.length > 0;
    }
    if (
      this.isSoftwareRole(
        profile?.dedicatedRole ?? profile?.preferredRole ?? null,
      ) &&
      task.category === 'System Design'
    ) {
      return sources.length > 0;
    }

    const role =
      profile?.dedicatedRole?.trim() ||
      profile?.preferredRole?.[0]?.trim() ||
      '';
    const allowedAnchors = [
      ...(profile?.resumeKeywords ?? []),
      ...(curriculum?.focus ?? []),
      ...skills,
      ...(role
        ? getRoleBlueprint(role).competencies.map(
            (competency) => competency.name,
          )
        : []),
    ].map((anchor) => anchor.toLowerCase());
    if (allowedAnchors.length === 0) return true;

    return (
      sources.some((source) => {
        const normalized = source.toLowerCase();
        return allowedAnchors.some(
          (anchor) =>
            anchor.includes(normalized) || normalized.includes(anchor),
        );
      }) || Boolean(task.sourceResumePoint?.trim())
    );
  }

  isSoftwareRole(roleInput: string | string[] | null): boolean {
    if (!roleInput) return false;
    const haystack = (
      Array.isArray(roleInput) ? roleInput.join(' ') : roleInput
    ).toLowerCase();
    return /\b(software|frontend|front.?end|backend|back.?end|full.?stack|computer\s+science|data\s+engineer|data\s+scientist|machine\s+learning|ml\s+engineer|ai\s+engineer|ios|android|mobile\s+develop|devops|dev\s+ops|cloud\s+engineer|embedded|firmware|site\s+reliability|sre|platform\s+engineer|cybersecurity|security\s+engineer|game\s+develop|swe|sde)\b/.test(
      haystack,
    );
  }

  private leetcodeDifficulty(mix: {
    easy: number;
    medium: number;
    hard: number;
  }): 'easy' | 'medium' | 'hard' {
    if (mix.hard > 0) return 'hard';
    if (mix.medium > 0) return 'medium';
    return 'easy';
  }

  private buildDailyPrompt(
    profile: OnboardingResponse | null,
    skills: string[],
    mix: { easy: number; medium: number; hard: number; total: number },
    recentTitles: string[] = [],
    curriculum?: CurriculumContext,
    seenLeetcodeUrls: string[] = [],
  ): string {
    const resumeText = profile?.resumeText?.slice(0, 3000) ?? '(not provided)';
    const currentStatus =
      profile?.currentStatus?.join(', ') || '(not specified)';
    const primaryFocus = profile?.primaryFocus?.join(', ') || '(not specified)';
    const interests = profile?.areasOfInterest?.join(', ') || '(not specified)';
    const yearsExperience = profile?.yearsOfExperience || '(not specified)';
    const parsedYears = Number(
      profile?.yearsOfExperience?.match(/\d+(?:\.\d+)?/)?.[0] ?? 0,
    );
    const experiencedCandidate = parsedYears >= 3;

    const dedicatedRole =
      profile?.dedicatedRole ??
      profile?.preferredRole?.[0] ??
      '(not specified)';
    const roleBlueprint = getRoleBlueprint(dedicatedRole);

    const aiKeywords = profile?.resumeKeywords ?? [];
    const keywordList =
      aiKeywords.length > 0
        ? aiKeywords.join(', ')
        : skills.length > 0
          ? skills.join(', ')
          : '(extract from resume)';

    const softwareRole = this.isSoftwareRole(
      profile?.dedicatedRole ?? profile?.preferredRole ?? null,
    );

    const avoidSection =
      recentTitles.length > 0
        ? `\n\nTASKS ALREADY SEEN BY THIS USER — DO NOT GENERATE ANY OF THESE OR CLOSE VARIATIONS:\n${recentTitles.map((t) => `  - ${t}`).join('\n')}\nEvery title above must be treated as strictly off-limits. Generate completely different Questions.`
        : '';
    const seenLeetcodeSection =
      seenLeetcodeUrls.length > 0
        ? `\n\nLEETCODE PROBLEMS ALREADY ASSIGNED — DO NOT REUSE ANY OF THESE URLS:\n${seenLeetcodeUrls.map((url) => `  - ${url}`).join('\n')}`
        : '';

    const curriculumSection = curriculum
      ? `
LEARNING TRACK CONTEXT (mandatory curriculum alignment):
- Track length: ${curriculum.durationMonths} month(s)
- Current week: ${curriculum.week} of ${curriculum.totalWeeks}
- Current phase: ${curriculum.phase}
- This week's required competencies: ${curriculum.focus.join(', ')}
- Weekly milestone: ${curriculum.milestone}

${
  softwareRole
    ? `Use the weekly competencies to choose the system-design focus, resume follow-up, and any extra technical-depth lane. The mandatory coding and behavioral lanes still remain.`
    : `At least ${Math.max(2, mix.total - 1)} of today's ${mix.total} questions MUST directly assess the required competencies above. The remaining question may be a due review, behavioral question, or resume/project deep-dive.`
}
Keep difficulty consistent with the requested mix.`
      : '';

    const foundationSection =
      curriculum && curriculum.week <= 2
        ? `
FOUNDATION VERIFICATION — WEEKS 1–2 (overrides normal acceleration):
- Mandatory foundations for "${dedicatedRole}" may NEVER be skipped, regardless of years of experience.
- This user has ${yearsExperience} of experience. Experience changes the DEPTH expected, not the list of foundations covered.
- ${experiencedCandidate ? `Use fewer recall-only prompts. At least ${Math.ceil(mix.total / 2)} questions must verify foundations through implementation details, trade-offs, failure modes, debugging, or "why" reasoning.` : `At least ${Math.max(2, mix.total - 1)} questions must directly verify core definitions, mechanics, and simple application before combining topics.`}
- Allow at most ONE resume-specific architecture or complex scenario today, and only when it clearly builds on a foundation being verified.
- Do not jump directly to senior architecture, large-scale design, or unnecessary multi-technology scenarios.
- A question labelled easy must test one foundational concept. Medium may combine a foundation with one realistic application. Hard is allowed only when the performance mix explicitly requests it.
`
        : '';

    let roleSpecificSection = '';
    let remainingMix = { ...mix };
    if (softwareRole) {
      const lcDiff = this.leetcodeDifficulty(mix);
      remainingMix = {
        ...mix,
        [lcDiff]: mix[lcDiff] - 1,
        total: mix.total - 1,
      };
      roleSpecificSection = `
CS/CODING ROLE TASK REQUIREMENTS:

Generate these four REQUIRED DAILY INTERVIEW LANES. Their categories must be exactly as written:

1 — "DSA" (MANDATORY LEETCODE):
- Exactly 1 of the ${mix.total} tasks MUST be a real LeetCode DSA problem.
- Set its difficulty to "${lcDiff}", category to "DSA".
- Set leetcodeUrl to the actual LeetCode problem URL: https://leetcode.com/problems/<problem-slug>/
- Choose a classic, well-known problem (e.g. two-sum, valid-parentheses, binary-search, merge-intervals) — do NOT invent a URL.
- Never reuse a problem listed in LEETCODE PROBLEMS ALREADY ASSIGNED.

2 — "System Design":
- Ask one realistic system-design interview question, not a definition or a children's explanation.
- Rotate across the delivery framework: clarifying functional/non-functional requirements,
  capacity estimates, core entities, APIs, data model, high-level design, deep dives, bottlenecks,
  reliability, observability, and trade-offs.
- Rotate the primary concept across days: networking, API design, data modeling, caching, sharding,
  consistent hashing, CAP, database indexing, latency/throughput estimates, or a key technology
  such as Kafka, Redis, Elasticsearch, API Gateway, DynamoDB, Cassandra, or PostgreSQL.
- The question must require the candidate to clarify constraints and defend design decisions.

3 — "Behavioral":
- Ask one specific STAR question about conflict, ambiguity, ownership, failure, incident response,
  prioritization, feedback, leadership, mentoring, or balancing delivery with quality.
- Require personal actions and measurable results; do not ask a vague personality question.

4 — "Resume & Project Deep-Dive":
- Quote or unmistakably reference one ACTUAL claim, metric, project, architecture, or responsibility
  from RESUME TEXT. Ask for the baseline, personal ownership, exact implementation, alternatives,
  trade-offs, validation method, and result.
- Example quality level: If the resume says API latency was reduced by 30% using caching, ask what
  was measured, which cache and cache-aside/write strategy was used, how invalidation and stampedes
  were handled, and how the 30% improvement was verified.
- Never invent a metric, project, technology, or responsibility that is not in the resume.

${
  mix.total > 4
    ? `5 — ONE EXTRA ROLE-CORE LANE:
- Choose one different category from "Databases", "Networking", "Operating Systems & Concurrency",
  "Testing & Reliability", "Programming & Code Quality", "Cloud & DevOps", "Frontend Engineering",
  or "Backend & APIs".
- Base it on either a relevant user skill or a mandatory target-role gap. Use a concrete debugging,
  implementation, or trade-off scenario.`
    : ''
}

THE ${remainingMix.total} NON-LEETCODE TASKS must contain ${remainingMix.easy} easy, ${remainingMix.medium} medium, and ${remainingMix.hard} hard:
- Every task MUST use a different category and a materially different concept.
- Do NOT label every task "Technical Concepts". Do NOT repeat a category in the same daily plan.
- Do NOT turn every question into a generic "${dedicatedRole}" scenario. Mention the role in a
  title only when it is necessary for meaning; normally ask directly about the skill or concept.
- leetcodeUrl must be null for all of these.`;
    } else {
      roleSpecificSection = `
PROFESSION-SPECIFIC INTERVIEW PLAN — Dedicated role: "${dedicatedRole}"
- Do NOT generate DSA, LeetCode, System Design, or any software-engineering tasks.
- All tasks must be real interview questions a hiring manager would ask for "${dedicatedRole}".

Generate one task for EACH required daily lane below. Use the category exactly as written:
${roleBlueprint.dailyLanes
  .map((lane, index) => `${index + 1} — "${lane.category}": ${lane.objective}`)
  .join('\n')}

ROLE COMPETENCIES TO ROTATE ACROSS DAYS:
${roleBlueprint.competencies.map((competency) => `- ${competency.name} (${competency.importance})`).join('\n')}

LANE QUALITY REQUIREMENTS:
- The foundations lane must test a specific principle, method, tool, standard, or body of knowledge
  expected for this profession. It must require application or reasoning, not a simple definition.
- The applied/case lane must present a realistic profession-specific situation with incomplete
  information, constraints, clarifying questions, alternatives, risks, and a defensible decision.
- The resume/experience lane must quote or unmistakably reference an ACTUAL resume achievement,
  project, responsibility, tool, decision, or measurable result. Ask for personal ownership,
  method, alternatives, validation, outcome, and lessons. Never invent resume evidence.
- The behavioral/judgment lane must require a specific STAR example or a concrete professional,
  ethical, safety, client, stakeholder, or leadership decision appropriate to this profession.
- Use the user's skills where they are relevant, but do not merely substitute a skill name into
  a generic template. The situation and expected reasoning must make professional sense.
- If ${mix.total} is 5, add one extra profession-specific category tied to a different important
  competency or skill; it must not duplicate any required lane or concept.
- Every task title MUST be a direct question or complete scenario, never a topic heading.
- leetcodeUrl must be null for every task.`;
    }

    return `
You are an expert interviewer and interview-curriculum designer for the candidate's target profession.
Generate rigorous, highly personalized questions at the standard used in real hiring interviews.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET ROLE:  ${dedicatedRole}
EXPERIENCE:   ${yearsExperience}
GOAL:         ${primaryFocus}
STATUS:       ${currentStatus}
INTERESTS:    ${interests}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUME KEYWORDS (rank these by relevance to the target role before selecting):
${keywordList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUME TEXT:
${resumeText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${curriculumSection}
${foundationSection}
${roleSpecificSection}

STRICT RULES — read every rule before generating:

RULE 1 — QUESTION FORMAT (mandatory):
  Every task title MUST be a complete interview question. Use one of these openers:
    "How would you…", "Explain how…", "Walk me through…", "What is the difference between…",
    "Why would you choose…", "Tell me about a time you…", "You are given X — how would you…"
  ❌ BANNED — never start a title with a gerund/noun phrase:
    "Designing…", "Optimizing…", "Building…", "Material Selection…", "Analysis of…"

RULE 2 — EVIDENCE-BASED COVERAGE (mandatory):
  Assign every question a DISTINCT primary anchor. An anchor must be either:
  (a) a mandatory competency from this week's learning track, or
  (b) a target-role-relevant resume keyword, project, achievement, or responsibility.
  For ${mix.total} questions, cover ${mix.total} different primary anchors. Do not ask multiple
  questions about the same keyword while other important anchors remain uncovered.
  Include the anchors in sourceKeywords. If grounded in a resume bullet/project, copy a short
  supporting fragment into sourceResumePoint. Never invent resume experience.
  ✅ GOOD: "How would you use MATLAB to simulate the fluid flow in a pipe network?"
  ✅ GOOD: "Walk me through how you would perform a static stress analysis in ANSYS for a composite bracket."
  ✅ GOOD: "Why would you choose SolidWorks over CATIA for sheet-metal part design?"
  ❌ BAD:  "How would you solve a design problem?" (no keyword, too vague)
  ❌ BAD:  "Explain material selection for a component." (no keyword, generic)

  A mandatory role topic may be asked even if it is not on the resume. In that case, name the
  exact topic/scenario and put that competency in sourceKeywords. Do not awkwardly insert an
  unrelated resume keyword just to satisfy personalization.

RULE 2B — DAILY VARIETY (mandatory):
  Today's plan is an interview set, not a list of paraphrases. Every task must have a different
  category and assess a materially different concept. Include both:
  (a) concepts connected to the user's actual skills/resume, and
  (b) essential concepts expected for the target role, even when not yet listed as a user skill.
  Never repeat the target-role name mechanically in every question.

RULE 3 — SPECIFICITY:
  Questions must name exact tools, techniques, or scenarios — not abstract concepts.
  Treat each question as if a real interviewer at a top company is asking it.
  Ban generic prompts such as "Tell me about yourself", "What are your strengths?", or
  "Describe a challenging project" without naming the relevant resume project and decision.

RULE 4 — DIFFICULTY LEVELS:
  easy   — directly tests knowledge of one specific tool/concept from the keywords list
  medium — requires combining 2+ keywords or concepts, or multi-step reasoning
  hard   — requires deep trade-off analysis, design decisions, or a project-level scenario
  Complexity must match the target role, experience level, resume evidence, and current phase.
  Do not create artificial complexity, combine unrelated technologies, or assume senior-level
  ownership that is unsupported by the profile.
  Difficulty labels describe interview complexity, not the candidate's years of experience.

RULE 5 — CATEGORIES must match the role domain. No software/CS categories for non-CS roles.

RULE 6 — Behavioral tasks use STAR format: "Tell me about a time you…"

RULE 7 — Only set leetcodeUrl for real LeetCode problems. Set it to null for everything else.

RULE 8 — PRIVATE QUALITY CHECK BEFORE OUTPUT (mandatory):
  For every question verify: role relevance, one clear skill being assessed, enough context to
  answer, realistic interview wording, evidence anchor, appropriate difficulty, and no duplicate.
  Silently discard and replace any question that fails even one check.
${avoidSection}
${seenLeetcodeSection}

Generate EXACTLY ${mix.total} tasks: ${mix.easy} easy, ${mix.medium} medium, ${mix.hard} hard.

Return ONLY a JSON array of exactly ${mix.total} objects:
[{"title":"...","description":"State exactly what a strong answer should address.","category":"...","difficulty":"easy|medium|hard","priority":"low|medium|high","tags":["..."],"time_minutes":25,"leetcodeUrl":null,"sourceKeywords":["exact primary anchor"],"sourceResumePoint":"short exact resume fragment or null","selectionReason":"why this is important for the target role now"}]
`.trim();
  }

  private sanitiseDifficulty(d: string): 'easy' | 'medium' | 'hard' {
    return ['easy', 'medium', 'hard'].includes(d)
      ? (d as 'easy' | 'medium' | 'hard')
      : 'medium';
  }

  private difficultyToPriority(d: string): 'low' | 'medium' | 'high' {
    return d === 'hard' ? 'high' : d === 'medium' ? 'medium' : 'low';
  }
}
