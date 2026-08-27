import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RagTask } from '../rag/rag-task.entity';
import { EvalRagService } from './eval-rag/eval-rag.service';
import { GeminiService } from './gemini.service';

describe('GeminiService submission evaluation', () => {
  let service: GeminiService;

  const task = (overrides: Partial<RagTask> = {}): RagTask => ({
    id: 1,
    title: 'Solve Valid Parentheses and explain why a stack is appropriate.',
    description:
      'Use a stack, reject a closing bracket that does not match the most recent opening bracket, and confirm the stack is empty at the end.',
    category: 'DSA',
    difficulty: 'easy',
    tags: ['Software Engineer', 'stack'],
    time_minutes: 25,
    is_active: true,
    created_at: new Date('2026-08-26T00:00:00Z'),
    priority: 'medium',
    user_id: '00000000-0000-0000-0000-000000000001',
    leetcodeUrl: null,
    source_keywords: ['stack', 'LIFO'],
    source_resume_point: null,
    selection_reason: 'Daily coding interview practice',
    ...overrides,
  });

  beforeEach(() => {
    const config = {
      get: jest.fn((key: string) =>
        key === 'GEMINI_API_KEY' ? 'test-key' : undefined,
      ),
    } as unknown as ConfigService;
    service = new GeminiService(config, new EvalRagService());
  });

  it.each([
    ['DSA', 'code_explanation'],
    ['System Design', 'design'],
    ['Behavioral & Leadership', 'star'],
    ['Behavioral & Professional Judgment', 'star'],
    ['Technical Concepts', 'concept'],
    ['Electrical Engineering Fundamentals', 'concept'],
    ['Legal Analysis & Authority', 'concept'],
    ['Business Case & Stakeholder Analysis', 'general'],
    ['Design, Test & Troubleshooting', 'general'],
    ['Case Strategy & Client Advice', 'general'],
    ['Ethics & Professional Judgment', 'general'],
    ['Resume & Matter Deep-Dive', 'general'],
  ])('maps %s to the %s evaluator', (category, expected) => {
    expect(service.getEvaluationType(category)).toBe(expected);
  });

  it('grades DSA without a URL as an algorithm task using its exact rubric', () => {
    const { prompt, evalType } = service.buildEvaluationPrompt(
      task(),
      'Push opening brackets. For a closing bracket, pop and compare. Return true only when the stack is empty.',
    );

    expect(evalType).toBe('code_explanation');
    expect(prompt).toContain('Detailed grading rubric: Use a stack');
    expect(prompt).toContain('Accept code, pseudocode, precise prose');
    expect(prompt).toContain('A concise answer can receive full credit');
    expect(prompt).not.toMatch(/minimum\s+\d+\s+words/i);
  });

  it('treats a real LeetCode URL as code-only despite legacy explanation wording', () => {
    const { prompt, evalType } = service.buildEvaluationPrompt(
      task({
        title:
          'Solve Group Anagrams and explain how you construct a stable grouping key.',
        description:
          'Explain the key, data structures, complexity, and edge cases.',
        leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/',
      }),
      'class Solution { public List<List<String>> groupAnagrams(String[] strs) { return List.of(); } }',
    );

    expect(evalType).toBe('leetcode');
    expect(prompt).toContain('LEETCODE CODE-ONLY EXCEPTION');
    expect(prompt).toContain('Never require or score a written explanation');
    expect(prompt).toContain('correct but non-optimal solution may still pass');
    expect(prompt).toContain(
      'feedback must name the optimal approach and complexity',
    );
  });

  it('includes profession, source, and resume evidence in grading context', () => {
    const { prompt } = service.buildEvaluationPrompt(
      task({
        title: 'How would you advise a client after conflicting authority?',
        category: 'Case Strategy & Client Advice',
        description:
          'Identify controlling authority, explain uncertainty, compare options and risks, and give a documented recommendation.',
        tags: ['Lawyer', 'client counseling'],
        source_keywords: ['authority', 'risk analysis'],
        source_resume_point: 'Researched motions and drafted client memoranda.',
      }),
      'I would first determine which authority controls, then explain the uncertainty and compare the risks of each lawful option.',
    );

    expect(prompt).toContain('Role/domain signals: Lawyer, client counseling');
    expect(prompt).toContain('Source competencies: authority, risk analysis');
    expect(prompt).toContain(
      'Resume evidence, if applicable: Researched motions and drafted client memoranda.',
    );
    expect(prompt).toContain('profession-appropriate methods or standards');
  });

  it('accepts correct LeetCode code without an explanation', async () => {
    jest
      .spyOn(
        service as unknown as {
          callWithFallback: (prompt: string) => Promise<{
            text: string;
            provider: string;
            model: string;
          }>;
        },
        'callWithFallback',
      )
      .mockResolvedValue({
        text: JSON.stringify({
          score: 9,
          feedback:
            'Correct LIFO approach with mismatch handling and an empty-stack final check.',
          approved: true,
          confidence: 0.95,
        }),
        provider: 'test-provider',
        model: 'test-model',
      });

    const result = await service.evaluateSubmission(
      task({
        leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
      }),
      'boolean isValid(String s) { Deque<Character> stack = new ArrayDeque<>(); /* matching implementation */ return stack.isEmpty(); }',
    );

    expect(result.approved).toBe(true);
    expect(result.score).toBe(9);
    expect(result.details.source).toBe('llm');
  });

  it('returns a retryable service error instead of a false rejection', async () => {
    jest
      .spyOn(
        service as unknown as {
          callWithFallback: (prompt: string) => Promise<never>;
        },
        'callWithFallback',
      )
      .mockRejectedValue(new Error('All eval providers failed'));

    await expect(
      service.evaluateSubmission(task(), 'A correct but concise answer.'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
