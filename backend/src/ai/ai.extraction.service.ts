import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai'; 

interface ParsedJob {
  company: string;
  role: string;
  status?: string;
}

interface AiProvider {
  name: string;
  baseURL: string;
  apiKey: string | undefined;
  model: string;
}

@Injectable()
export class AiExtractionService {
  private readonly logger = new Logger(AiExtractionService.name);
  private readonly providers: AiProvider[];

constructor(private configService: ConfigService) {
  const openRouterKey = this.configService.get<string>('OPENROUTER_API_KEY');
  const groqKey = this.configService.get<string>('GROQ_API_KEY');
  const geminiKey = this.configService.get<string>('GEMINI_API_KEY');

  this.providers = [
    // ── OpenRouter free models (tried in order) ──────────────────────
{ name: 'openrouter/gpt-oss-120b',   baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'openai/gpt-oss-120b:free' },
  { name: 'openrouter/gpt-oss-20b',    baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'openai/gpt-oss-20b:free' },
  { name: 'openrouter/qwen3-235b',     baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'qwen/qwen3-235b-a22b:free' },
  { name: 'openrouter/qwen3-8b',       baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'qwen/qwen3-8b:free' },
  { name: 'openrouter/nemotron-120b',  baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'nvidia/nemotron-3-super-120b:free' },
  { name: 'openrouter/mistral-small',  baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'mistralai/mistral-small-3.1-24b-instruct:free' },
  { name: 'openrouter/deepseek-r1',    baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'deepseek/deepseek-r1:free' },
  { name: 'openrouter/gemma-4-31b',    baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'google/gemma-4-31b-it:free' },
  { name: 'openrouter/gemma-3-27b',    baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'google/gemma-3-27b-it:free' },
  { name: 'openrouter/gemma-3-12b',    baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'google/gemma-3-12b-it:free' },
  { name: 'openrouter/minimax-m2.5',   baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'minimax/minimax-m2.5:free' },
  { name: 'openrouter/trinity-large',  baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'arcee-ai/trinity-large:free' },
  { name: 'openrouter/devstral',       baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey, model: 'mistralai/devstral-small:free' },

    // ── Groq fallback ────────────────────────────────────────────────
    { name: 'groq', baseURL: 'https://api.groq.com/openai/v1', apiKey: groqKey, model: 'llama-3.3-70b-versatile' },

    // ── Gemini last resort ───────────────────────────────────────────
    { name: 'gemini', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai', apiKey: geminiKey, model: 'gemini-2.0-flash' },
  ];
}

  async extractJobFromEmail(subject: string, from: string, body: string): Promise<ParsedJob> {
    const prompt = `You are parsing a job application email. Extract the company name, job role/title, and application status.

Email subject: ${subject}
Email from: ${from}
Email body (first 1500 chars): ${body.slice(0, 1500)}

Reply with ONLY a JSON object, no markdown, no explanation:
{"company": "Company Name", "role": "Job Title", "status": "Applied"}

Rules:
- Unknown company → "Unknown Company", unknown role → "Unknown Role"
- Role: exact title from email, no tracking IDs
- Status: exactly one of "Applied" | "Interview" | "Offer" | "Rejected"
- Default status to "Applied" if unsure`;

    for (const provider of this.providers) {
      if (!provider.apiKey) continue;

      try {
        const client = new OpenAI({
          apiKey: provider.apiKey,
          baseURL: provider.baseURL,
          defaultHeaders: provider.name === 'openrouter' ? {
            'HTTP-Referer': this.configService.get('APP_URL') ?? 'https://localhost:3000',
            'X-Title': 'Anchor App Tracker',
          } : undefined,
        });

        const response = await client.chat.completions.create({
          model: provider.model,
          max_tokens: 120,
          temperature: 0,
          messages: [{ role: 'user', content: prompt }],
        });

        const raw = response.choices[0]?.message?.content?.trim() ?? '';
        const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(jsonText);

        const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
        this.logger.debug(`ai-success provider=${provider.name} company="${parsed.company}" role="${parsed.role}"`);

        return {
          company: typeof parsed.company === 'string' && parsed.company ? parsed.company : 'Unknown Company',
          role:    typeof parsed.role    === 'string' && parsed.role    ? parsed.role    : 'Unknown Role',
          status:  validStatuses.includes(parsed.status) ? parsed.status : undefined,
        };

      } catch (err) {
        const msg = String(err);
        const isRateLimit = /429|rate.?limit|quota.?exceeded|resource.?exhausted/i.test(msg);
        this.logger.warn(`ai-provider-failed provider=${provider.name} rateLimit=${isRateLimit}: ${msg.slice(0, 120)}`);
        continue;
      }
    }

    // All providers exhausted — triggers aiRateLimited flag in the scanner
    throw new Error('429: all AI providers rate-limited or unavailable');
  }
}