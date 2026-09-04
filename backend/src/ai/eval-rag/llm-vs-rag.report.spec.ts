import { config as loadEnv } from 'dotenv';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../gemini.service';
import { EvalRagService } from './eval-rag.service';
import { EvalType } from './eval-exemplar.types';
import { EVAL_FIXTURES, fixtureToTask } from './eval-rag.fixtures';

loadEnv();

/**
 * Writes LLM vs RAG-only feedback side-by-side (production modes).
 * LLM = criteria prompt via provider chain. RAG = exemplar template (no LLM).
 *
 * Generate (from `backend/`, needs GEMINI_API_KEY or GROQ_API_KEY):
 *   npm run report:llm-vs-rag
 *
 * Output: src/ai/eval-rag/reports/LLM_VS_RAG_FEEDBACK_REPORT.md
 */
describe('LLM vs RAG feedback report', () => {
  const rag = new EvalRagService();
  const config = {
    get: (key: string) => {
      if (key === 'GEMINI_API_KEY')
        return process.env.GEMINI_API_KEY ?? 'test-key';
      if (key === 'EVAL_PROVIDER')
        return process.env.EVAL_PROVIDER ?? 'gemini-2.5';
      if (key === 'GROQ_API_KEY') return process.env.GROQ_API_KEY;
      if (key === 'OPENROUTER_API_KEY') return process.env.OPENROUTER_API_KEY;
      return undefined;
    },
  } as unknown as ConfigService;

  const service = new GeminiService(config, rag);
  const hasLiveKey =
    process.env.RUN_LIVE_EVAL_REPORT === 'true' &&
    Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);

  (hasLiveKey ? it : it.skip)(
    'generates LLM_VS_RAG_FEEDBACK_REPORT.md',
    async () => {
      const generatedAt = new Date().toISOString();
      let llmLabel = 'LLM';
      const rows: Array<{
        label: string;
        question: string;
        category: string;
        difficulty: string;
        answer: string;
        llmScore: number;
        llmApproved: boolean;
        llmFeedback: string;
        llmProvider: string;
        ragScore: number;
        ragApproved: boolean;
        ragFeedback: string;
        ragExemplars: string[];
      }> = [];

      for (const fixture of EVAL_FIXTURES) {
        const task = fixtureToTask(fixture.task);
        const evalType = (
          task.leetcodeUrl || /leetcode/i.test(task.title)
            ? 'leetcode'
            : service.getEvaluationType(task.category)
        ) as EvalType;

        const llm = await service.evaluateSubmission(task, fixture.answer);
        const provider =
          llm.details?.source === 'llm'
            ? `${llm.details.provider ?? 'unknown'} / ${llm.details.model ?? ''}`
            : `fallback (${llm.details?.source ?? 'unknown'})`;
        if (llm.details?.source === 'llm' && llm.details.model) {
          llmLabel = `${llm.details.provider} (${llm.details.model})`;
        }

        const ragOnly = rag.gradeWithoutLlm(
          evalType,
          task.difficulty,
          task.title,
          fixture.answer,
          task.tags ?? [],
        );

        rows.push({
          label: fixture.label,
          question: task.title,
          category: task.category,
          difficulty: task.difficulty,
          answer: fixture.answer,
          llmScore: llm.score,
          llmApproved: llm.approved,
          llmFeedback: llm.feedback,
          llmProvider: provider,
          ragScore: ragOnly.score,
          ragApproved: ragOnly.approved,
          ragFeedback: ragOnly.feedback,
          ragExemplars: ragOnly.exemplarIds,
        });
      }

      let md = `# LLM vs RAG Feedback Report\n\n`;
      md += `Generated: \`${generatedAt}\`\n\n`;
      md += `Regenerate (from \`backend/\`, needs \`GEMINI_API_KEY\` or \`GROQ_API_KEY\`):\n\n`;
      md += `\`\`\`bash\nnpm run report:llm-vs-rag\n\`\`\`\n\n`;
      md += `Compares production modes:\n`;
      md += `- **LLM** — criteria prompt + provider chain (name recorded per case)\n`;
      md += `- **RAG-only** — exemplar templates / heuristics (no API)\n\n`;
      md += `Primary LLM seen this run: **${llmLabel}**\n\n`;

      md += `## Summary\n\n`;
      md += `| Case | LLM score | RAG score | LLM provider |\n`;
      md += `| --- | ---: | ---: | --- |\n`;
      for (const row of rows) {
        md += `| ${row.label} | ${row.llmScore} (${row.llmApproved ? 'pass' : 'fail'}) | ${row.ragScore} (${row.ragApproved ? 'pass' : 'fail'}) | ${row.llmProvider} |\n`;
      }
      md += `\n---\n\n`;

      for (const row of rows) {
        md += `## ${row.label}\n\n`;
        md += `| | |\n| --- | --- |\n`;
        md += `| **Question** | ${row.question.replace(/\|/g, '\\|')} |\n`;
        md += `| **Category** | ${row.category} |\n`;
        md += `| **Difficulty** | ${row.difficulty} |\n\n`;
        md += `### Answer\n\n> ${row.answer.replace(/\n/g, '\n> ')}\n\n`;
        md += `### Scores\n\n`;
        md += `| Mode | Score | Result |\n| --- | ---: | --- |\n`;
        md += `| LLM (${row.llmProvider}) | ${row.llmScore} | ${row.llmApproved ? 'pass' : 'fail'} |\n`;
        md += `| RAG-only | ${row.ragScore} | ${row.ragApproved ? 'pass' : 'fail'} |\n\n`;
        md += `### Feedback\n\n`;
        md += `#### LLM\n\n${row.llmFeedback}\n\n`;
        md += `#### RAG-only\n\n${row.ragFeedback}\n\n`;
        md += `_Exemplars: \`${row.ragExemplars.join('`, `')}\`_\n\n---\n\n`;
      }

      const outDir = join(__dirname, 'reports');
      mkdirSync(outDir, { recursive: true });
      const outPath = join(outDir, 'LLM_VS_RAG_FEEDBACK_REPORT.md');
      writeFileSync(outPath, md, 'utf8');
      // eslint-disable-next-line no-console
      console.log(`Wrote ${outPath}`);
      expect(rows.length).toBe(EVAL_FIXTURES.length);
      expect(md).toContain('### Answer');
      expect(md).toContain('#### LLM');
      expect(md).toContain('#### RAG-only');
    },
    300_000,
  );

  it('returns a retryable error when the LLM provider chain fails', async () => {
    const failing = new GeminiService(
      {
        get: (key: string) => {
          if (key === 'GEMINI_API_KEY') return 'fake-key';
          if (key === 'EVAL_PROVIDER') return 'gemini-2.5';
          // No GROQ / OpenRouter keys → chain fails after gemini errors
          return undefined;
        },
      } as unknown as ConfigService,
      rag,
    );

    // Force provider call to fail without network by stubbing
    const stub = failing as unknown as {
      callWithFallback: () => Promise<never>;
    };
    stub.callWithFallback = async () => {
      throw new Error('All eval providers failed');
    };

    const fixture = EVAL_FIXTURES[0];
    const task = fixtureToTask(fixture.task);
    await expect(
      failing.evaluateSubmission(task, fixture.answer),
    ).rejects.toMatchObject({
      response: {
        error: 'Evaluation Unavailable',
        retryable: true,
      },
    });
  });

  it('uses the hard unavailable stub when LLM and RAG both fail', async () => {
    const emptyRag = {
      retrieve: () => ({ exemplars: [] }),
      gradeWithoutLlm: () => ({
        score: 0,
        approved: false,
        feedback: 'Unable to evaluate submission. Please try again.',
        exemplarIds: [] as string[],
      }),
    } as unknown as EvalRagService;

    const failing = new GeminiService(
      {
        get: (key: string) => {
          if (key === 'GEMINI_API_KEY') return 'fake-key';
          if (key === 'EVAL_PROVIDER') return 'gemini-2.5';
          return undefined;
        },
      } as unknown as ConfigService,
      emptyRag,
    );

    const stub = failing as unknown as {
      callWithFallback: () => Promise<never>;
    };
    stub.callWithFallback = async () => {
      throw new Error('All eval providers failed');
    };

    const fixture = EVAL_FIXTURES[0];
    const task = fixtureToTask(fixture.task);
    await expect(
      failing.evaluateSubmission(task, fixture.answer),
    ).rejects.toMatchObject({
      response: {
        error: 'Evaluation Unavailable',
        message: 'Unable to evaluate submission. Please try again.',
        retryable: true,
      },
    });
  });
});
