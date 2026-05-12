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

interface TaskProvider {
  name: string;
  type: 'openai-compat' | 'gemini';
  baseURL?: string;
  apiKeyEnv: string;
  model: string;
}

const TASK_PROVIDERS: TaskProvider[] = [
  { name: 'groq',       type: 'openai-compat', baseURL: 'https://api.groq.com/openai/v1', apiKeyEnv: 'GROQ_API_KEY',       model: 'llama-3.3-70b-versatile' },
  { name: 'openrouter', type: 'openai-compat', baseURL: 'https://openrouter.ai/api/v1',   apiKeyEnv: 'OPENROUTER_API_KEY', model: 'openai/gpt-oss-120b:free' },
  { name: 'gemini-2.5', type: 'gemini',                                                   apiKeyEnv: 'GEMINI_API_KEY',     model: 'gemini-2.5-flash' },
  { name: 'gemini-lite', type: 'gemini', apiKeyEnv: 'GEMINI_API_KEY', model: 'gemini-2.5-flash-lite' },
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
    const selected = this.configService.get<string>('TASK_PROVIDER') ?? 'gemini-2.5';

    const provider = TASK_PROVIDERS.find(p => p.name === selected);
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
          const model = this.genAI.getGenerativeModel({ model: provider.model });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          this.logger.log(`✅ Used model: ${provider.name}`);
          return text;
        }

      } catch (err: any) {
        const status: number = err?.status ?? err?.code ?? 0;
        const msg: string = err?.message ?? String(err);

        const isOverload = status === 503 || /overloaded|high demand/i.test(msg);
        const isQuotaOrAuth = status === 429 || status === 403 || /quota|depleted/i.test(msg);

        if (isOverload && attempt === 1) {
          this.logger.warn(`⚠️ ${provider.name} overloaded — retrying in 8s…`);
          await sleep(8000);
          continue;
        }

        if (isQuotaOrAuth) {
          this.logger.warn(`⚠️ ${provider.name} quota/auth error (${status}) — skipping`);
        } else {
          this.logger.warn(`⚠️ ${provider.name} failed (${status}: ${msg.slice(0, 120)})`);
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
  ): Promise<RagTask[]> {
    const profile = await this.onboardingRepo.findOne({ where: { userId } });
    const userSkills = await this.userSkillRepo.find({ where: { userId } });
    const skillNames = userSkills.map((s) => s.skillName);

    const seenRows = await this.userSeenTaskRepo.find({ where: { user_id: userId } });
    const seenKeys = new Set(seenRows.map((r) => r.title_key));
    const seenTitles = seenRows.map((r) => r.title_key);

    const prompt = this.buildDailyPrompt(profile, skillNames, mix, seenTitles);

    this.logger.log(`🎯 Role: ${profile?.dedicatedRole ?? profile?.preferredRole?.[0]}`);
    this.logger.log(`🔑 Keywords (${(profile?.resumeKeywords ?? skillNames).length}): ${(profile?.resumeKeywords ?? skillNames).join(', ')}`);
    this.logger.log(`📚 Interests: ${profile?.areasOfInterest?.join(', ')}`);

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

  private isSoftwareRole(roleInput: string | string[] | null): boolean {
    if (!roleInput) return false;
    const haystack = (Array.isArray(roleInput) ? roleInput.join(' ') : roleInput).toLowerCase();
    return /\b(software|frontend|front.?end|backend|back.?end|full.?stack|computer\s+science|data\s+engineer|data\s+scientist|machine\s+learning|ml\s+engineer|ai\s+engineer|ios|android|mobile\s+develop|devops|dev\s+ops|cloud\s+engineer|embedded|firmware|site\s+reliability|sre|platform\s+engineer|cybersecurity|security\s+engineer|game\s+develop|swe|sde)\b/.test(haystack);
  }

  private leetcodeDifficulty(mix: { easy: number; medium: number; hard: number }): 'easy' | 'medium' | 'hard' {
    if (mix.hard > 0) return 'hard';
    if (mix.medium > 0) return 'medium';
    return 'easy';
  }

  private buildDailyPrompt(
    profile: OnboardingResponse | null,
    skills: string[],
    mix: { easy: number; medium: number; hard: number; total: number },
    recentTitles: string[] = [],
  ): string {
    const resumeText    = profile?.resumeText?.slice(0, 3000) ?? '(not provided)';
    const currentStatus = profile?.currentStatus?.join(', ')   || '(not specified)';
    const primaryFocus  = profile?.primaryFocus?.join(', ')    || '(not specified)';
    const interests     = profile?.areasOfInterest?.join(', ') || '(not specified)';

    const dedicatedRole = profile?.dedicatedRole
      ?? profile?.preferredRole?.[0]
      ?? '(not specified)';

    const aiKeywords = profile?.resumeKeywords ?? [];
    const keywordList =
      aiKeywords.length > 0
        ? aiKeywords.join(', ')
        : skills.length > 0
          ? skills.join(', ')
          : '(extract from resume)';

    const softwareRole = this.isSoftwareRole(profile?.dedicatedRole ?? profile?.preferredRole ?? null);

    const avoidSection =
      recentTitles.length > 0
        ? `\n\nTASKS ALREADY SEEN BY THIS USER — DO NOT GENERATE ANY OF THESE OR CLOSE VARIATIONS:\n${recentTitles.map((t) => `  - ${t}`).join('\n')}\nEvery title above must be treated as strictly off-limits. Generate completely different Questions.`
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

1 — MANDATORY LEETCODE DSA TASK:
- Exactly 1 of the ${mix.total} tasks MUST be a real LeetCode DSA problem.
- Set its difficulty to "${lcDiff}", category to "DSA".
- Set leetcodeUrl to the actual LeetCode problem URL: https://leetcode.com/problems/<problem-slug>/
- Choose a classic, well-known problem (e.g. two-sum, valid-parentheses, binary-search, merge-intervals) — do NOT invent a URL.

${remainingMix.total} — REMAINING TASKS (${remainingMix.easy} easy, ${remainingMix.medium} medium, ${remainingMix.hard} hard):
- These must cover core CS/software interview topics. Rotate through categories such as:
    • "System Design"       — e.g. design a rate limiter, URL shortener, notification system
    • "Technical Concepts"  — e.g. OS (processes vs threads, virtual memory), Database (indexing, transactions, ACID), Networking (TCP vs UDP, HTTP/HTTPS, DNS), OOP/SOLID principles
    • "Behavioral"          — STAR format questions on teamwork, conflict, leadership, project delivery
    • "Learning & Upskilling" — deep-dive into a tool/framework from the user's resume
- Pick categories based on the user's resume and target role — do NOT repeat the same category twice.
- leetcodeUrl must be null for all of these.`;
    } else {
      roleSpecificSection = `
NON-TECHNICAL ROLE DETECTED — Dedicated role: "${dedicatedRole}"
- Do NOT generate DSA, LeetCode, System Design, or any software-engineering tasks.
- All tasks must be real interview questions a hiring manager would ask for "${dedicatedRole}".
- Every task title MUST be phrased as a direct interview question or scenario — NOT as an activity or gerund phrase.
  ✅ CORRECT: "How would you use MATLAB to model the thermal behavior of a heat exchanger?"
  ✅ CORRECT: "Walk me through your process for selecting a material for a load-bearing component."
  ✅ CORRECT: "Tell me about a time you used SolidWorks to solve a design problem."
  ❌ WRONG:   "Designing for Manufacturability" (gerund phrase — banned)
  ❌ WRONG:   "Material Selection for Medical Device" (topic phrase — banned)
- Use the user's RESUME KEYWORDS directly inside the question title (e.g. if they know SolidWorks, ANSYS, MATLAB — ask about those tools specifically, not generics).
- Use categories that genuinely match this profession. Examples by field:
    • Mechanical Engineering: "Technical Concepts", "Engineering Design", "Behavioral", "CAD & Simulation", "Materials & Manufacturing"
    • Law / Legal: "Case Analysis", "Legal Research", "Statutory Interpretation", "Legal Writing", "Behavioral"
    • Finance / Accounting: "Financial Modeling", "Valuation", "Accounting Principles", "Case Study", "Behavioral"
    • Business Analysis: "Requirements Elicitation", "Process Modeling", "Stakeholder Management", "Case Study", "Behavioral"
    • Any role: "Behavioral" (STAR format "Tell me about a time you…") is always appropriate.
- Every question must reference a specific tool, concept, or experience from the user's actual resume keywords.
- leetcodeUrl must be null for every task.`;
    }

    return `
You are an expert technical interviewer generating highly personalised interview practice questions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET ROLE:  ${dedicatedRole}
INTERESTS:    ${interests}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUME KEYWORDS (the user actually knows these — use them directly in question titles):
${keywordList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUME TEXT:
${resumeText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${roleSpecificSection}

STRICT RULES — read every rule before generating:

RULE 1 — QUESTION FORMAT (mandatory):
  Every task title MUST be a complete interview question. Use one of these openers:
    "How would you…", "Explain how…", "Walk me through…", "What is the difference between…",
    "Why would you choose…", "Tell me about a time you…", "You are given X — how would you…"
  ❌ BANNED — never start a title with a gerund/noun phrase:
    "Designing…", "Optimizing…", "Building…", "Material Selection…", "Analysis of…"

RULE 2 — USE RESUME KEYWORDS IN TITLES (mandatory):
  Each title MUST contain at least one specific keyword from the RESUME KEYWORDS list above.
  ✅ GOOD: "How would you use MATLAB to simulate the fluid flow in a pipe network?"
  ✅ GOOD: "Walk me through how you would perform a static stress analysis in ANSYS for a composite bracket."
  ✅ GOOD: "Why would you choose SolidWorks over CATIA for sheet-metal part design?"
  ❌ BAD:  "How would you solve a design problem?" (no keyword, too vague)
  ❌ BAD:  "Explain material selection for a component." (no keyword, generic)

RULE 3 — SPECIFICITY:
  Questions must name exact tools, techniques, or scenarios — not abstract concepts.
  Treat each question as if a real interviewer at a top company is asking it.

RULE 4 — DIFFICULTY LEVELS:
  easy   — directly tests knowledge of one specific tool/concept from the keywords list
  medium — requires combining 2+ keywords or concepts, or multi-step reasoning
  hard   — requires deep trade-off analysis, design decisions, or a project-level scenario

RULE 5 — CATEGORIES must match the role domain. No software/CS categories for non-CS roles.

RULE 6 — Behavioral tasks use STAR format: "Tell me about a time you…"

RULE 7 — Only set leetcodeUrl for real LeetCode problems. Set it to null for everything else.
${avoidSection}

Generate EXACTLY ${mix.total} tasks: ${mix.easy} easy, ${mix.medium} medium, ${mix.hard} hard.

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