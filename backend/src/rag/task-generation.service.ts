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

type Diff = 'easy' | 'medium' | 'hard';

const ROLE_ONLY_FALLBACKS: Record<Diff, string[]> = {
  easy: [
    'Tell me about a typical week as a ${role}. What work would you expect to own?',
    'How would you explain what a ${role} does to someone outside the field in under two minutes?',
    'What is one skill or habit interviewers look for in a strong ${role} candidate, and how would you show you have it?',
  ],
  medium: [
    'Walk me through how you would start if you joined a team as a ${role} and the goals were unclear.',
    'You have two urgent requests and time for only one. How would you decide as a ${role}, and what would you say to the person you delay?',
    'Describe a time, or a scenario,where you had to push back on a request as a ${role}. How would you handle it in an interview answer?'
  ],
  hard: [
    'What trade-offs would you consider when making a high-impact decision as a ${role}?',
    'How would you know after 30-60 days that you were succeeding as a ${role}? What signals would you track?',
    'A project you own as a ${role} is going off track. Walk me through how you would diagnose the problem and recover.'  
  ],
};

const ROLE_SKILL_FALLBACKS: Record<Diff, string[]> = {
  easy: [
    'Interviewers for ${role} roles often ask about ${skill}. How would you explain it, and when would you use it?',
    'What is one common mistake people make with ${skill}, and how would you avoid it as a ${role}?',
    'How would you teach a teammate the basics of ${skill} in five minutes if they needed it for a ${role} task?',
  ],
  medium: [
    'You are a ${role} with limited time. How would you use ${skill} to make progress this week, and what would you intentionally leave out?',
    'A stakeholder says the current approach using ${skill} is too slow or too complex. How would you respond as a ${role}?',
    'Walk me through how you would troubleshoot a broken or unexpected result that involves ${skill} in a ${role} workflow.',
  ],
  hard: [
    'Compare ${skill} to one realistic alternative for a high-stakes ${role} decision. Which would you choose, and what would make you switch?',
    'As a ${role}, how would you design a small end-to-end approach that depends on ${skill}, including how you would validate success and what you would monitor after release?',
    'Tell me about the biggest risk of leaning too heavily on ${skill} in a ${role} context, and how you would mitigate it before it becomes a production or client problem.',
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
      this.logger.warn(
        `Skipping generation for ${userId}: missing role`,
      );
      return [];
    }

    const seenRows = await this.userSeenTaskRepo.find({ where: { user_id: userId } });
    const seenKeys = new Set(seenRows.map((r) => r.title_key));
    const seenTitles = seenRows.map((r) => r.title_key);

    const prompt = this.buildDailyPrompt(
      profile,
      skillNames,
      mix,
      seenTitles,
      curriculum,
    );

    this.logger.log(`🎯 Role: ${profile?.dedicatedRole ?? profile?.preferredRole?.[0]}`);
    this.logger.log(`🔑 Keywords (${(profile?.resumeKeywords ?? skillNames).length}): ${(profile?.resumeKeywords ?? skillNames).join(', ')}`);
    this.logger.log(`📚 Interests: ${profile?.areasOfInterest?.join(', ')}`);

    const fresh: GeneratedTaskDto[] = [];
    const reserve: GeneratedTaskDto[] = [];
    const candidateKeys = new Set<string>();
    const usedAnchors = new Set<string>();
    const acceptedByDifficulty = { easy: 0, medium: 0, hard: 0 };

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
      if (!text) continue;
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) continue;

      let candidates: GeneratedTaskDto[] = [];
      try {
        candidates = JSON.parse(match[0]) as GeneratedTaskDto[];
      } catch {
        this.logger.warn('Failed to parse LLM JSON response');
        continue;
      }

      for (const task of candidates) {
        if (!task.title) continue;
        const titleKey = this.normaliseTitle(task.title);
        if (seenKeys.has(titleKey) || candidateKeys.has(titleKey)) continue;
        const difficulty = this.sanitiseDifficulty(task.difficulty);
        if (!this.isHighQualityTask(task, profile, curriculum)) continue;
        candidateKeys.add(titleKey);
        reserve.push(task);
        if (acceptedByDifficulty[difficulty] >= mix[difficulty]) continue;
        const primaryAnchor =
          this.taskSources(task)[0]?.toLowerCase() ??
          task.sourceResumePoint?.trim().toLowerCase();
        if (!primaryAnchor || usedAnchors.has(primaryAnchor)) continue;
        usedAnchors.add(primaryAnchor);
        seenKeys.add(titleKey);
        acceptedByDifficulty[difficulty]++;
        fresh.push(task);
        if (fresh.length >= mix.total) break;
      }
    }

    // Keep the exact difficulty/topic spread as the first choice. If the model
    // produced enough sound questions but repeated a primary topic or missed a
    // difficulty quota, use those vetted questions rather than throwing away
    // the entire day. Difficulty is normalized to the remaining requested mix.
    if (fresh.length < mix.total) {
      const freshKeys = new Set(fresh.map((task) => this.normaliseTitle(task.title)));
      for (const task of reserve) {
        const titleKey = this.normaliseTitle(task.title);
        if (freshKeys.has(titleKey)) continue;
        const neededDifficulty = (['easy', 'medium', 'hard'] as const).find(
          (difficulty) => acceptedByDifficulty[difficulty] < mix[difficulty],
        );
        if (!neededDifficulty) break;
        fresh.push({ ...task, difficulty: neededDifficulty });
        freshKeys.add(titleKey);
        seenKeys.add(titleKey);
        acceptedByDifficulty[neededDifficulty]++;
        if (fresh.length >= mix.total) break;
      }
    }

    if (fresh.length < mix.total) {
      const fallbacks = this.buildProfileFallbackTasks(
        profile,
        skillNames,
        curriculum,
        mix,
        acceptedByDifficulty,
        seenKeys,
        fresh.length,
      );
      fresh.push(...fallbacks);
    }

    if (fresh.length < 3) {
      // This should only be reachable for an invalid zero-sized request. Keep a
      // diagnostic instead of silently presenting an empty Smart Plan.
      this.logger.error(
        `Unable to assemble the minimum daily plan for ${userId} (${fresh.length} tasks).`,
      );
      throw new Error('Unable to assemble the minimum daily Smart Plan');
    }

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
          (curriculum ? `Required for ${curriculum.phase}` : 'Target-role preparation'),
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

  private buildProfileFallbackTasks(
    profile: OnboardingResponse | null,
    skills: string[],
    curriculum: CurriculumContext | undefined,
    mix: { easy: number; medium: number; hard: number; total: number },
    accepted: { easy: number; medium: number; hard: number },
    seenKeys: Set<string>,
    alreadyGenerated: number,
  ): GeneratedTaskDto[] {
    const role =
      profile?.dedicatedRole?.trim() ||
      profile?.preferredRole?.[0]?.trim() ||
      null;
    if (!role) return [];

    const anchors = [
      ...new Set(
        [
          ...(curriculum?.focus ?? []),
          ...(profile?.resumeKeywords ?? []),
          ...skills,
        ]
          .map((value) => value?.trim())
          .filter(Boolean),
      ),
    ];

    const bank = anchors.length > 0 ? ROLE_SKILL_FALLBACKS : ROLE_ONLY_FALLBACKS;
    const needed = Math.max(0, mix.total - alreadyGenerated);
    const output: GeneratedTaskDto[] = [];
    const remaining = {
      easy: Math.max(0, mix.easy - accepted.easy),
      medium: Math.max(0, mix.medium - accepted.medium),
      hard: Math.max(0, mix.hard - accepted.hard),
    };

    const pools = {
      easy: [...bank.easy],
      medium: [...bank.medium],
      hard: [...bank.hard],
    };

    for (let index = 0; output.length < needed && index < 20; index++) {
      const difficulty = (['easy', 'medium', 'hard'] as Diff[]).find(
        (candidate) => remaining[candidate] > 0 && pools[candidate].length > 0,
      );
      if (!difficulty) break;

      const pick = Math.floor(Math.random() * pools[difficulty].length);
      const stem = pools[difficulty].splice(pick, 1)[0];
      const skill = anchors.length > 0 ? anchors[index % anchors.length] : '';

      const title = stem
        .replaceAll('${role}', role)
        .replaceAll('${skill}', skill);

      const titleKey = this.normaliseTitle(title);
      if (seenKeys.has(titleKey)) continue;
      seenKeys.add(titleKey);
      remaining[difficulty]--;

      output.push({
        title,
        description: skill
          ? `A strong answer should explain ${skill}, apply it in the context of ${role}, and describe how success would be measured.`
          : `A strong answer should be specific to ${role}, use a concrete example, and show clear judgment.`,
        category: skill ? 'Technical Concepts' : 'Behavioral',
        difficulty,
        priority: this.difficultyToPriority(difficulty),
        tags: skill ? [skill, role] : [role],
        time_minutes: 25,
        leetcodeUrl: undefined,
        sourceKeywords: skill ? [skill] : [role],
        sourceResumePoint: null,
        selectionReason: curriculum
          ? `Required for week ${curriculum.week}: ${curriculum.phase}`
          : `Core preparation for ${role}`,
      });
    }

    if (output.length > 0) {
      this.logger.warn(
        `Filled ${output.length} daily-plan slot(s) with profile-aligned fallback questions.`,
      );
    }
    return output;
  }

  private taskSources(task: GeneratedTaskDto): string[] {
    const sources = Array.isArray(task.sourceKeywords)
      ? task.sourceKeywords
      : Array.isArray(task.tags)
        ? task.tags
        : [];
    return [...new Set(sources.map((source) => String(source).trim()).filter(Boolean))].slice(0, 4);
  }

  private isHighQualityTask(
    task: GeneratedTaskDto,
    profile: OnboardingResponse | null,
    curriculum?: CurriculumContext,
  ): boolean {
    const title = task.title?.trim() ?? '';
    const isLeetcode =
      task.category === 'DSA' && Boolean(normalizeLeetcodeUrl(task.leetcodeUrl));
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

    const allowedAnchors = [
      ...(profile?.resumeKeywords ?? []),
      ...(curriculum?.focus ?? []),
    ].map((anchor) => anchor.toLowerCase());
    if (allowedAnchors.length === 0) return true;

    return sources.some((source) => {
      const normalized = source.toLowerCase();
      return allowedAnchors.some(
        (anchor) => anchor.includes(normalized) || normalized.includes(anchor),
      );
    }) || Boolean(task.sourceResumePoint?.trim());
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
    curriculum?: CurriculumContext,
  ): string {
    const resumeText    = profile?.resumeText?.slice(0, 3000) ?? '(not provided)';
    const currentStatus = profile?.currentStatus?.join(', ')   || '(not specified)';
    const primaryFocus  = profile?.primaryFocus?.join(', ')    || '(not specified)';
    const interests     = profile?.areasOfInterest?.join(', ') || '(not specified)';
    const yearsExperience = profile?.yearsOfExperience || '(not specified)';
    const parsedYears = Number(
      profile?.yearsOfExperience?.match(/\d+(?:\.\d+)?/)?.[0] ?? 0,
    );
    const experiencedCandidate = parsedYears >= 3;

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

    const curriculumSection = curriculum
      ? `
LEARNING TRACK CONTEXT (mandatory curriculum alignment):
- Track length: ${curriculum.durationMonths} month(s)
- Current week: ${curriculum.week} of ${curriculum.totalWeeks}
- Current phase: ${curriculum.phase}
- This week's required competencies: ${curriculum.focus.join(', ')}
- Weekly milestone: ${curriculum.milestone}

At least ${Math.max(2, mix.total - 1)} of today's ${mix.total} questions MUST directly assess the required competencies above. The remaining question may be a due review, behavioral question, or resume/project deep-dive. Keep difficulty consistent with the requested mix.`
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
- Ground personalized questions in target-role-relevant RESUME KEYWORDS or an actual resume point. Mandatory role competencies may be tested directly even when absent from the resume.
- Use categories that genuinely match this profession. Examples by field:
    • Mechanical Engineering: "Technical Concepts", "Engineering Design", "Behavioral", "CAD & Simulation", "Materials & Manufacturing"
    • Law / Legal: "Case Analysis", "Legal Research", "Statutory Interpretation", "Legal Writing", "Behavioral"
    • Finance / Accounting: "Financial Modeling", "Valuation", "Accounting Principles", "Case Study", "Behavioral"
    • Business Analysis: "Requirements Elicitation", "Process Modeling", "Stakeholder Management", "Case Study", "Behavioral"
    • Any role: "Behavioral" (STAR format "Tell me about a time you…") is always appropriate.
- Every question must reference a specific role competency, tool, concept, or actual resume experience.
- leetcodeUrl must be null for every task.`;
    }

    return `
You are an expert technical interviewer generating highly personalised interview practice questions.

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
