import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { RagTask } from '../rag/rag-task.entity';
import { EvaluationResult } from './interfaces/evaluation-result.interface';

interface EvalProvider {
  name: string;
  type: 'openai-compat' | 'gemini';
  baseURL?: string;
  apiKeyEnv: string;
  model: string;
}

const EVAL_PROVIDERS: EvalProvider[] = [
  { name: 'groq',       type: 'openai-compat', baseURL: 'https://api.groq.com/openai/v1', apiKeyEnv: 'GROQ_API_KEY',       model: 'llama-3.3-70b-versatile' },
  { name: 'openrouter', type: 'openai-compat', baseURL: 'https://openrouter.ai/api/v1',   apiKeyEnv: 'OPENROUTER_API_KEY', model: 'openai/gpt-oss-120b:free' },
  { name: 'gemini-2.5', type: 'gemini',                                                   apiKeyEnv: 'GEMINI_API_KEY',     model: 'gemini-2.5-flash' },
  { name: 'gemini-lite', type: 'gemini', apiKeyEnv: 'GEMINI_API_KEY', model: 'gemini-2.5-flash-lite' },
];

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined in environment variables. ' +
          'Please add it to your .env file.',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ─── Unified provider call ───────────────────────────────────────────────────

  private async callWithFallback(prompt: string): Promise<string> {
    const selected = this.configService.get<string>('EVAL_PROVIDER') ?? 'gemini-2.0';

    const primary = EVAL_PROVIDERS.find(p => p.name === selected);
    if (!primary) throw new Error(`Unknown EVAL_PROVIDER: ${selected}`);

    // Build the ordered list: primary first, then groq → gemini-2.5 as fallbacks
    const fallbackNames = ['groq', 'gemini-2.5'];
    const chain: EvalProvider[] = [
      primary,
      ...fallbackNames
        .filter(name => name !== selected)
        .map(name => EVAL_PROVIDERS.find(p => p.name === name)!)
        .filter(Boolean),
    ];

    for (const provider of chain) {
      const apiKey = this.configService.get<string>(provider.apiKeyEnv);
      if (!apiKey) {
        console.warn(`[Eval] skipping ${provider.name} — API key not set`);
        continue;
      }

      let attempt = 0;
      while (attempt < 2) {
        attempt++;
        try {
          let text = '';

          if (provider.type === 'openai-compat') {
            const client = new OpenAI({ apiKey, baseURL: provider.baseURL });
            const response = await client.chat.completions.create({
              model: provider.model,
              max_tokens: 1000,
              temperature: 0,
              messages: [{ role: 'user', content: prompt }],
            });
            text = response.choices[0]?.message?.content?.trim() ?? '';
            if (!text) throw new Error('Empty response from provider');
          } else if (provider.type === 'gemini') {
            const m = this.genAI.getGenerativeModel({ model: provider.model });
            const result = await m.generateContent(prompt);
            text = result.response.text();
          } else {
            throw new Error('Unknown provider type');
          }

          console.log(`[Eval] provider=${provider.name} success`);
          return text;

        } catch (err: any) {
          const msg = String(err?.message ?? err);
          const is503 = /503|Service Unavailable|high demand/i.test(msg);
          const isQuotaOrAuth = /429|quota|rate.?limit|depleted|auth/i.test(msg);

          if (is503 && attempt === 1) {
            console.warn(`[Eval] ${provider.name} overloaded — retrying in 2s…`);
            await this.sleep(2000);
            continue;
          }

          if (isQuotaOrAuth) {
            console.warn(`[Eval] ${provider.name} quota/auth error — trying next fallback`);
          } else {
            console.warn(`[Eval] ${provider.name} failed (${msg.slice(0, 120)}) — trying next fallback`);
          }
          break;
        }
      }
    }

    throw new Error('All eval providers failed');
  }

  // ─── Main evaluation entry point ─────────────────────────────────────────────

  async evaluateSubmission(
    task: RagTask,
    userAnswer: string,
  ): Promise<EvaluationResult> {
    if (task.leetcodeUrl || /leetcode/i.test(task.title)) {
      return this.evaluateLeetcodeCode(task, userAnswer);
    }

    const evaluationType = this.getEvaluationType(task.category);
    switch (evaluationType) {
      case 'star':             return this.evaluateSTAR(task, userAnswer);
      case 'concept':          return this.evaluateConcept(task, userAnswer);
      case 'design':           return this.evaluateSystemDesign(task, userAnswer);
      case 'code_explanation': return this.evaluateCodeExplanation(task, userAnswer);
      default:                 return this.evaluateGeneral(task, userAnswer);
    }
  }

  // ─── Evaluation methods ───────────────────────────────────────────────────────

  private async evaluateLeetcodeCode(
    task: RagTask,
    userCode: string,
  ): Promise<EvaluationResult> {
    const prompt = `
You are a senior software engineer reviewing a LeetCode solution.

PROBLEM: "${task.title}"
LeetCode URL: ${task.leetcodeUrl}
Difficulty: ${task.difficulty}

USER'S CODE:
\`\`\`
${userCode}
\`\`\`

The user solved this problem on LeetCode and pasted their accepted code here.
Evaluate ONLY the code — do NOT penalise for missing explanations.

CRITERIA:
1. Is this a plausible correct solution for "${task.title}"?
2. Is the syntax valid in at least one major language (Python, Java, C++, JavaScript, etc.)?
3. Does it cover common edge cases?
4. Is the time/space complexity reasonable for a ${task.difficulty} LeetCode problem?

Be generous: if the code looks like a legitimate accepted solution, approve it.
Only reject if the submission is empty, completely unrelated, or clearly incorrect.

Return ONLY valid JSON (no markdown, no backticks):
{
  "score": 8.0,
  "isCorrect": true,
  "isValidSyntax": true,
  "handlesEdgeCases": true,
  "hasReasonableComplexity": true,
  "feedback": "Clean and efficient solution.",
  "approved": true,
  "confidence": 0.90
}
`;
    return this.callGeminiAndParse(prompt, 'leetcode');
  }

  private getEvaluationType(category: string): string {
    const map: Record<string, string> = {
      Behavioral: 'star',
      'Technical Concepts': 'concept',
      'System Design': 'design',
      DSA: 'code_explanation',
      'Learning & Upskilling': 'concept',
      'Tech Trends & Deep Dives': 'concept',
    };
    return map[category] || 'general';
  }

  private async evaluateSTAR(
    task: RagTask,
    userAnswer: string,
  ): Promise<EvaluationResult> {
    const prompt = `
Evaluate this behavioral interview answer.

TASK DETAILS:
Title: "${task.title}"
Category: ${task.category}
Difficulty: ${task.difficulty}
Tags: ${task.tags.join(', ')}

EXPECTED FORMAT: STAR (Situation, Task, Action, Result)

USER'S ANSWER:
"${userAnswer}"

EVALUATION CRITERIA:
1. Does the answer directly address the question: "${task.title}"?
2. Has clear Situation (context/background)
3. Has defined Task (challenge/goal)
4. Has specific Action (what they actually did)
5. Has measurable Result (outcome/learning)
6. Is specific and detailed (not generic)
7. Shows self-awareness and learning

Minimum 150 words expected.

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "score": 8.5,
  "hasSituation": true,
  "hasTask": true,
  "hasAction": true,
  "hasResult": true,
  "isSpecific": true,
  "wordCount": 250,
  "feedback": "Strong answer with clear STAR structure. The situation and actions are well-defined. Consider adding specific metrics in the result section.",
  "approved": true,
  "confidence": 0.92
}
`;
    return this.callGeminiAndParse(prompt, task.difficulty);
  }

  private async evaluateConcept(
    task: RagTask,
    userAnswer: string,
  ): Promise<EvaluationResult> {
    const prompt = `
Evaluate this technical concept explanation.

TASK DETAILS:
Title: "${task.title}"
Category: ${task.category}
Difficulty: ${task.difficulty}

USER'S EXPLANATION:
"${userAnswer}"

EVALUATION CRITERIA:
1. Does it explain the concept asked in "${task.title}"?
2. Is technically accurate?
3. Covers all key points for this topic?
4. Uses examples or analogies?
5. Shows genuine understanding (not copy-pasted from documentation)?

Minimum 100 words expected.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": 7.5,
  "isAccurate": true,
  "coversKeyPoints": true,
  "hasExamples": true,
  "showsUnderstanding": true,
  "wordCount": 180,
  "feedback": "Good explanation covering the key concepts. Adding a practical example would strengthen your answer.",
  "approved": true,
  "confidence": 0.88
}
`;
    return this.callGeminiAndParse(prompt, task.difficulty);
  }

  private async evaluateSystemDesign(
    task: RagTask,
    userAnswer: string,
  ): Promise<EvaluationResult> {
    const prompt = `
Evaluate this system design explanation.

TASK DETAILS:
Title: "${task.title}"
Category: ${task.category}
Difficulty: ${task.difficulty}

USER'S DESIGN:
"${userAnswer}"

EVALUATION CRITERIA:
1. Does it address the specific system mentioned in "${task.title}"?
2. Includes essential components (database, API, cache, etc.)?
3. Discusses trade-offs and design decisions?
4. Considers scalability and performance?
5. Shows architectural thinking?

Minimum 150 words expected.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": 8.0,
  "hasComponents": true,
  "discussesTradeoffs": true,
  "considersScalability": true,
  "wordCount": 220,
  "feedback": "Solid system design with good component breakdown. Consider discussing how you'd handle failure scenarios.",
  "approved": true,
  "confidence": 0.85
}
`;
    return this.callGeminiAndParse(prompt, task.difficulty);
  }

  private async evaluateCodeExplanation(
    task: RagTask,
    userAnswer: string,
  ): Promise<EvaluationResult> {
    const prompt = `
Evaluate this algorithm/code explanation.

TASK DETAILS:
Title: "${task.title}"
Category: ${task.category}
Problem: ${this.extractProblemName(task.title)}

USER'S EXPLANATION:
"${userAnswer}"

EVALUATION CRITERIA:
1. Does it explain the approach for "${task.title}"?
2. Mentions the optimal approach/algorithm?
3. Discusses time and space complexity?
4. Shows understanding of WHY this solution works?

Minimum 100 words expected.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": 7.0,
  "explainsApproach": true,
  "mentionsComplexity": true,
  "showsUnderstanding": true,
  "wordCount": 150,
  "feedback": "Good explanation of the approach. Adding complexity analysis would improve your answer.",
  "approved": true,
  "confidence": 0.80
}
`;
    return this.callGeminiAndParse(prompt, task.difficulty);
  }

  private async evaluateGeneral(
    task: RagTask,
    userAnswer: string,
  ): Promise<EvaluationResult> {
    const prompt = `
Evaluate this answer.

TASK: "${task.title}"
CATEGORY: ${task.category}

USER'S ANSWER:
"${userAnswer}"

Evaluate if the answer:
1. Addresses the task question
2. Is thoughtful and complete
3. Shows effort and understanding

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": 7.0,
  "feedback": "Good effort. Your answer addresses the question.",
  "approved": true,
  "confidence": 0.75
}
`;
    return this.callGeminiAndParse(prompt, task.difficulty);
  }

  // ─── Parse response ───────────────────────────────────────────────────────────

  private async callGeminiAndParse(
    prompt: string,
    difficulty: string,
  ): Promise<EvaluationResult> {
    try {
      const text = await this.callWithFallback(prompt);
      console.log(`[Eval] Using provider: ${this.configService.get('EVAL_PROVIDER') ?? 'gemini-2.0'}`);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const passingScore = this.getPassingScore(difficulty);
      const approved = parsed.score >= passingScore;

      console.log('🤖 AI returned:', parsed.approved);
      console.log('✅ We calculated:', approved);
      console.log('📊 Score:', parsed.score, 'vs', passingScore);

      delete parsed.approved;

      return {
        score: parsed.score,
        feedback: parsed.feedback,
        approved,
        confidence: parsed.confidence || 0.8,
        details: {
          ...parsed,
          approved,
          passingScore,
        },
      };
    } catch (error) {
      console.error('Evaluation error:', error);
      return {
        score: 0,
        feedback: 'Unable to evaluate submission. Please try again.',
        approved: false,
        confidence: 0,
        details: { approved: false },
      };
    }
  }

  private getPassingScore(difficulty: string): number {
    const scores: Record<string, number> = {
      leetcode: 5.0,
      easy: 6.0,
      medium: 7.0,
      hard: 7.0,
    };
    return scores[difficulty] || 6.0;
  }

  private extractProblemName(title: string): string {
    const match = title.match(/(?:#\d+\s)?(.+?)(?:\s*\(|$)/);
    return match ? match[1].trim() : title;
  }
}