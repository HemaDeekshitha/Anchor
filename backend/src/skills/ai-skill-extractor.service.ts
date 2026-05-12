import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

const GEMINI_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

@Injectable()
export class AiSkillExtractorService {
  private readonly logger = new Logger(AiSkillExtractorService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Extracts ALL relevant keywords from a resume:
   * name, target role, technologies, tools, frameworks, cloud services,
   * domain concepts, certifications, methodologies — everything that
   * describes what this person knows and is targeting.
   */
  async extractKeywords(resumeText: string): Promise<string[]> {
    this.logger.log('Extracting keywords from resume...');

    const prompt = `
You are a resume parser. Extract ALL relevant keywords from this resume that describe:
- The candidate's name
- Their target job title / role
- All technologies, programming languages, frameworks, and tools mentioned
- Specific cloud services (e.g. "Azure Blob Storage", "AWS Lambda", "Google BigQuery")
- Domain-specific concepts and methodologies (e.g. "RESTful APIs", "microservices", "machine learning", "FEA")
- Certifications and qualifications
- Industry or domain (e.g. "fintech", "healthcare", "embedded systems")
- Any other keyword that helps understand what this person does and what they are targeting

Rules:
- Return ONLY a JSON array of short keyword strings
- Keep each keyword concise (1-4 words)
- Include specific service names, not just generic ones (e.g. "Azure Blob Storage" not just "Azure")
- No duplicates, no explanations
- Aim for 30-80 keywords covering the full breadth of the resume

Resume:
${resumeText.slice(0, 4000)}

Return ONLY a JSON array, example: ["React", "Azure Blob Storage", "Software Engineer", "Python", "microservices"]
`.trim();

    // ── Stage 1: Gemini models ──────────────────────────────────────────────
    for (const modelName of GEMINI_FALLBACK_MODELS) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const content = result.response
          .text()
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        const keywords = JSON.parse(content);
        if (Array.isArray(keywords)) {
          this.logger.log(`Extracted ${keywords.length} keywords using ${modelName}`);
          return keywords as string[];
        }
        return [];
      } catch (err: any) {
        const isRateLimit =
          err?.status === 429 ||
          err?.message?.includes('429') ||
          err?.message?.toLowerCase().includes('quota') ||
          err?.message?.toLowerCase().includes('rate');

        if (isRateLimit) {
          this.logger.warn(`${modelName} quota exhausted — trying next model…`);
          continue;
        }

        this.logger.warn(`${modelName} keyword extraction failed: ${err?.message}`);
        return [];
      }
    }

    this.logger.warn('All Gemini models exhausted — falling back to Groq then OpenRouter');

    // ── Stage 2: Groq → OpenRouter fallback chain ───────────────────────────
    const openaiCompatFallbacks = [
      {
        name: 'groq',
        baseURL: 'https://api.groq.com/openai/v1',
        apiKeyEnv: 'GROQ_API_KEY',
        model: 'llama-3.3-70b-versatile',
      },
      {
        name: 'openrouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKeyEnv: 'OPENROUTER_API_KEY',
        model: 'openai/gpt-oss-120b:free',
      },
    ];

    for (const provider of openaiCompatFallbacks) {
      const apiKey = this.configService.get<string>(provider.apiKeyEnv);
      if (!apiKey) {
        this.logger.warn(`${provider.name} skipped — API key not set`);
        continue;
      }

      try {
        const client = new OpenAI({ apiKey, baseURL: provider.baseURL });
        const response = await client.chat.completions.create({
          model: provider.model,
          max_tokens: 1000,
          temperature: 0,
          messages: [{ role: 'user', content: prompt }],
        });

        const raw = response.choices[0]?.message?.content?.trim() ?? '';
        const content = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const keywords = JSON.parse(content);

        if (Array.isArray(keywords)) {
          this.logger.log(`Extracted ${keywords.length} keywords using ${provider.name}`);
          return keywords as string[];
        }
        return [];
      } catch (err: any) {
        const isRateLimit = /429|quota|rate.?limit/i.test(String(err?.message ?? err));
        if (isRateLimit) {
          this.logger.warn(`${provider.name} quota exhausted — trying next fallback…`);
          continue;
        }
        this.logger.warn(`${provider.name} keyword extraction failed: ${err?.message}`);
      }
    }

    this.logger.warn('All providers exhausted during keyword extraction.');
    return [];
  }
}