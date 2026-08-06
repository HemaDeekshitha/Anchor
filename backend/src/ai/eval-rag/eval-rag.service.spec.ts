import { EvalRagService, EVAL_UNAVAILABLE_FEEDBACK } from './eval-rag.service';
import { EVAL_EXEMPLARS } from './eval-exemplars.data';

describe('EvalRagService', () => {
  const service = new EvalRagService();

  it('loads a non-trivial exemplar corpus', () => {
    expect(service.corpusSize()).toBe(EVAL_EXEMPLARS.length);
    expect(service.corpusSize()).toBeGreaterThanOrEqual(30);
  });

  it('retrieves same-type exemplars and prefers matching difficulty', () => {
    const { exemplars } = service.retrieve(
      'design',
      'medium',
      'Design a news-feed service with fan-out',
      ['feed', 'timeline'],
      2,
    );

    expect(exemplars).toHaveLength(2);
    expect(exemplars.every((item) => item.evalType === 'design')).toBe(true);
    expect(exemplars[0].difficulty).toBe('medium');
    expect(
      exemplars.some((item) =>
        item.topics.some((topic) => /feed|fan-out|timeline/i.test(topic)),
      ),
    ).toBe(true);
  });

  it('retrieves STAR exemplars for behavioral conflict prompts', () => {
    const { exemplars } = service.retrieve(
      'star',
      'easy',
      'Tell me about a time you disagreed with a teammate',
      ['conflict'],
      2,
    );

    expect(exemplars[0].evalType).toBe('star');
    expect(exemplars[0].rubricChecklist.length).toBeGreaterThanOrEqual(5);
  });

  it('falls back to same-type exemplars when difficulty pool is thin', () => {
    const { exemplars } = service.retrieve(
      'leetcode',
      'hard',
      'Hard optimization problem solution',
      [],
      2,
    );
    expect(exemplars.length).toBeGreaterThan(0);
    expect(exemplars.every((item) => item.evalType === 'leetcode')).toBe(true);
  });

  it('grades without an LLM using retrieved exemplars', () => {
    const weak = service.gradeWithoutLlm(
      'concept',
      'easy',
      'Explain how database indexes speed up queries',
      'Indexes make databases faster.',
      ['index'],
    );
    const strong = service.gradeWithoutLlm(
      'concept',
      'easy',
      'Explain how database indexes speed up queries',
      'An index is often a B-tree mapping values to rows so queries avoid full scans. Example: WHERE email = X. Trade-off: faster reads, slower writes and extra storage.',
      ['index'],
    );

    expect(weak.approved).toBe(false);
    expect(weak.feedback.length).toBeGreaterThan(20);
    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.exemplarIds.length).toBeGreaterThan(0);
  });

  it('returns the hard unavailable stub when no exemplar is retrieved', () => {
    jest.spyOn(service, 'retrieve').mockReturnValueOnce({ exemplars: [] });

    const result = service.gradeWithoutLlm(
      'star',
      'easy',
      'Any question',
      'Any answer',
      [],
    );

    expect(result.score).toBe(0);
    expect(result.approved).toBe(false);
    expect(result.exemplarIds).toEqual([]);
    expect(result.feedback).toBe(EVAL_UNAVAILABLE_FEEDBACK);
  });
});
