import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RagTask } from './rag-task.entity';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { UserSkill } from '../skills/user-skills.entity';
import { UserSeenTask } from './user-seen-task.entity';

interface GeneratedTaskDto {
  title: string;
  description?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  time_minutes: number;
  leetcodeUrl?: string;
}

// Fallback chain: try each model in order until one succeeds.
const GEMINI_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
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

  /** Tries each Gemini model in turn; returns the text on first success. */
  private async callGeminiWithFallback(prompt: string): Promise<string | null> {
    for (const modelName of GEMINI_FALLBACK_MODELS) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        this.logger.log(`✅ Used model: ${modelName}`);
        return text;
      } catch (err: any) {
        const isRateLimit =
          err?.status === 429 ||
          err?.message?.includes('429') ||
          err?.message?.toLowerCase().includes('quota') ||
          err?.message?.toLowerCase().includes('rate');

        if (isRateLimit) {
          this.logger.warn(`⚠️ ${modelName} quota exhausted — trying next model…`);
          continue;
        }

        this.logger.error(`Task generation failed on ${modelName}`, err?.message);
        return null;
      }
    }
    this.logger.warn('All Gemini models exhausted — task generation skipped.');
    return null;
  }

  /**
   * Generates exactly `mix.total` fresh tasks for today, tailored to the
   * user's resume, onboarding selections, and extracted skills.
   * The LLM determines the appropriate domain and task types — nothing is hardcoded.
   */
  async generateTasksForToday(
    userId: string,
    mix: { easy: number; medium: number; hard: number; total: number },
  ): Promise<RagTask[]> {
    const profile = await this.onboardingRepo.findOne({ where: { userId } });
    const userSkills = await this.userSkillRepo.find({ where: { userId } });
    const skillNames = userSkills.map((s) => s.skillName);

    // ── Fetch full seen-task history from DB ─────────────────────────────────
    const seenRows = await this.userSeenTaskRepo.find({ where: { user_id: userId } });
    const seenKeys = new Set(seenRows.map((r) => r.title_key));
    const seenTitles = seenRows.map((r) => r.title_key);

    const prompt = this.buildDailyPrompt(profile, skillNames, mix, seenTitles);

    let generated: GeneratedTaskDto[] = [];
    const text = await this.callGeminiWithFallback(prompt);
    if (text) {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          generated = JSON.parse(match[0]) as GeneratedTaskDto[];
        } catch {
          this.logger.warn('Failed to parse LLM JSON response');
        }
      }
    }

    if (generated.length === 0) return [];

    // ── Hard post-filter: drop any title the user has already seen ───────────
    const fresh = generated
      .filter((t) => t.title)
      .filter((t) => !seenKeys.has(this.normaliseTitle(t.title)))
      .slice(0, mix.total);

    if (fresh.length === 0) return [];

    const toSave = fresh.map((t) =>
      this.ragTaskRepo.create({
        title: t.title,
        description: t.description ?? null,
        category: t.category || 'Technical Concepts',
        difficulty: this.sanitiseDifficulty(t.difficulty),
        priority: this.difficultyToPriority(t.difficulty),
        tags: Array.isArray(t.tags) ? t.tags.slice(0, 5) : [],
        time_minutes: t.time_minutes ?? 25,
        leetcodeUrl: t.leetcodeUrl ?? null,
        user_id: userId,
        is_active: true,
      }),
    );

    const saved = await this.ragTaskRepo.save(toSave);

    // ── Record every saved task so it's never repeated ───────────────────────
    const seenEntries = saved.map((task) =>
      this.userSeenTaskRepo.create({
        user_id: userId,
        task_id: task.id,
        title_key: this.normaliseTitle(task.title),
      }),
    );
    // INSERT … ON CONFLICT DO NOTHING via the unique index on (user_id, title_key)
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

  // ─── Software role detection ────────────────────────────────────────────────
  /** Returns true when the user has selected a software/frontend/backend role. */
  private isSoftwareRole(preferredRole: string[] | null): boolean {
    if (!preferredRole || preferredRole.length === 0) return false;
    const haystack = preferredRole.join(' ').toLowerCase();
    return /\b(software|frontend|front-end|backend|back-end|full.?stack)\b/.test(haystack);
  }

  /**
   * Picks the difficulty for the forced LeetCode task.
   * Uses the highest difficulty present in today's mix so it counts against one slot.
   */
  private leetcodeDifficulty(mix: { easy: number; medium: number; hard: number }): 'easy' | 'medium' | 'hard' {
    if (mix.hard > 0) return 'hard';
    if (mix.medium > 0) return 'medium';
    return 'easy';
  }

  // ─── Prompt construction ────────────────────────────────────────────────────
  private buildDailyPrompt(
    profile: OnboardingResponse | null,
    skills: string[],
    mix: { easy: number; medium: number; hard: number; total: number },
    recentTitles: string[] = [],
  ): string {
    const resumeText    = profile?.resumeText?.slice(0, 3000) ?? '(not provided)';
    const targetRoles   = profile?.preferredRole?.join(', ')   || '(not specified)';
    const currentStatus = profile?.currentStatus?.join(', ')   || '(not specified)';
    const primaryFocus  = profile?.primaryFocus?.join(', ')    || '(not specified)';
    const interests     = profile?.areasOfInterest?.join(', ') || '(not specified)';

    // AI-extracted resume keywords take priority; fall back to catalog skills
    const aiKeywords = profile?.resumeKeywords ?? [];
    const keywordList =
      aiKeywords.length > 0
        ? aiKeywords.join(', ')
        : skills.length > 0
          ? skills.join(', ')
          : '(extract from resume)';

    const softwareRole = this.isSoftwareRole(profile?.preferredRole ?? null);

    const avoidSection =
      recentTitles.length > 0
        ? `\n8. Do NOT repeat any of these recently assigned tasks (titles to avoid):\n${recentTitles.map((t) => `   - ${t}`).join('\n')}`
        : '';

    // When a software role is selected, one task is always a LeetCode problem.
    // That task consumes one difficulty slot from the mix; compute the remainder.
    let leetcodeSection = '';
    let remainingMix = { ...mix };
    if (softwareRole) {
      const lcDiff = this.leetcodeDifficulty(mix);
      remainingMix = {
        ...mix,
        [lcDiff]: mix[lcDiff] - 1,
        total: mix.total - 1,
      };
      leetcodeSection = `
LEETCODE REQUIREMENT (software role detected):
- Exactly 1 of the ${mix.total} tasks MUST be a real LeetCode DSA problem.
- Set its difficulty to "${lcDiff}", category to "DSA".
- Set leetcodeUrl to the actual LeetCode problem URL in the format: https://leetcode.com/problems/<problem-slug>/
- Choose a classic, well-known problem (e.g. two-sum, valid-parentheses, binary-search, merge-intervals) — do NOT invent a URL.
- The remaining ${remainingMix.total} tasks follow the normal breakdown: ${remainingMix.easy} easy, ${remainingMix.medium} medium, ${remainingMix.hard} hard — NO leetcodeUrl for these.`;
    }

    return `
You are an expert career coach. Generate today's personalized interview practice tasks for this job seeker.

USER PROFILE
Target role(s): ${targetRoles}
Current status: ${currentStatus}
Primary focus:  ${primaryFocus}
Interests:      ${interests}
Keywords extracted from resume: ${keywordList}

Resume:
---
${resumeText}
---
${leetcodeSection}

INSTRUCTIONS
1. Use the extracted keywords and resume to understand the user's domain, target role, and specific tools/technologies they have worked with.
2. Generate EXACTLY ${mix.total} tasks: ${mix.easy} easy, ${mix.medium} medium, ${mix.hard} hard.
   - easy: foundational — something a junior in this field should know
   - medium: applies 2+ concepts or requires multi-step thinking
   - hard: deep expertise, design decisions, or complex problem-solving
3. Task titles must be specific and actionable — NOT vague topics.
4. Choose categories that match the user's actual domain (e.g. "DSA", "System Design", "Technical Concepts", "Behavioral", "Engineering Design", etc.). Do NOT force software categories on non-software roles.
5. Behavioral tasks should use STAR format ("Tell me about a time you…").
6. Only set leetcodeUrl for real LeetCode problems (only when the LEETCODE REQUIREMENT above applies). For all other tasks set leetcodeUrl to null.
7. Every task must reference tools, technologies, or concepts from the user's actual resume.${avoidSection}

Return ONLY a JSON array of exactly ${mix.total} objects:
[{"title":"...","description":"...","category":"...","difficulty":"easy|medium|hard","priority":"low|medium|high","tags":["..."],"time_minutes":25,"leetcodeUrl":null}]
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