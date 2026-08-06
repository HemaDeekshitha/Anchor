import { Injectable } from '@nestjs/common';
import { EVAL_EXEMPLARS } from './eval-exemplars.data';
import {
  EvalDifficulty,
  EvalExemplar,
  EvalType,
} from './eval-exemplar.types';

export interface EvalRagRetrieval {
  exemplars: EvalExemplar[];
}

export const EVAL_UNAVAILABLE_FEEDBACK =
  'Unable to evaluate submission. Please try again.';

@Injectable()
export class EvalRagService {
  private readonly corpus = EVAL_EXEMPLARS;

  /**
   * Lexical RAG over a curated exemplar bank.
   * Filter by eval type + difficulty, then rank by topic/title overlap.
   */
  retrieve(
    evalType: EvalType,
    difficulty: string,
    taskTitle: string,
    tags: string[] = [],
    limit = 2,
  ): EvalRagRetrieval {
    const diff = this.normaliseDifficulty(difficulty);
    const queryTokens = this.tokenize([taskTitle, ...tags].join(' '));

    const scored = this.corpus
      .filter((item) => item.evalType === evalType)
      .map((item) => {
        const topicTokens = this.tokenize(
          [...item.topics, item.questionPattern].join(' '),
        );
        const overlap = this.jaccard(queryTokens, topicTokens);
        const difficultyBoost = item.difficulty === diff ? 0.35 : 0;
        return { item, score: overlap + difficultyBoost };
      })
      .sort((a, b) => b.score - a.score);

    // Prefer difficulty matches; fall back to best same-type exemplars.
    const preferred = scored.filter((row) => row.item.difficulty === diff);
    const pool = preferred.length >= limit ? preferred : scored;
    const exemplars = pool.slice(0, limit).map((row) => row.item);

    return { exemplars };
  }

  corpusSize(): number {
    return this.corpus.length;
  }

  // RAG-only grading
  gradeWithoutLlm(
    evalType: EvalType,
    difficulty: string,
    taskTitle: string,
    userAnswer: string,
    tags: string[] = [],
  ): {
    score: number;
    approved: boolean;
    feedback: string;
    exemplarIds: string[];
  } {
    const { exemplars } = this.retrieve(
      evalType,
      difficulty,
      taskTitle,
      tags,
      2,
    );
    const primary = exemplars[0];
    if (!primary) {
      return {
        score: 0,
        approved: false,
        feedback: EVAL_UNAVAILABLE_FEEDBACK,
        exemplarIds: [],
      };
    }

    const answer = userAnswer.trim();
    const wordCount = answer.split(/\s+/).filter(Boolean).length;

    const strongOverlap = this.jaccard(
      this.tokenize(answer),
      this.tokenize(primary.strongExemplar),
    );

    // Topic coverage vs exemplar topics / question pattern (better than
    // matching abstract checklist labels like "Technically accurate").
    const topicCoverage = this.jaccard(
      this.tokenize(answer),
      this.tokenize([...primary.topics, primary.questionPattern].join(' ')),
    );

    const weakHits = primary.weakSignals.filter((signal) => {
      // Prefer detecting absence patterns for short answers.
      return wordCount < 40 && /generic|only says|no |lacks|buzz|vague/i.test(signal)
        ? true
        : false;
    }).length;

    let score = 4;
    if (wordCount >= 100) score += 2.5;
    else if (wordCount >= 50) score += 1.5;
    else if (wordCount < 25) score -= 2;

    score += strongOverlap * 4;
    score += topicCoverage * 2.5;
    score -= Math.min(2, weakHits);

    if (wordCount < 20) score = Math.min(score, 3.5);
    if (wordCount >= 80 && strongOverlap >= 0.08) score = Math.max(score, 7);

    score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));
    const passing =
      difficulty === 'leetcode' ? 5 : difficulty === 'easy' ? 6 : 7;
    const approved = score >= passing;

    const missingHints = primary.rubricChecklist.slice(0, 3);
    const feedback = approved
      ? primary.feedbackAnchors.strong
      : `${primary.feedbackAnchors.weak} Focus on: ${missingHints.join('; ')}.`;

    return {
      score,
      approved,
      feedback,
      exemplarIds: exemplars.map((ex) => ex.id),
    };
  }

  private normaliseDifficulty(difficulty: string): EvalDifficulty {
    const value = difficulty?.toLowerCase();
    if (value === 'easy' || value === 'medium' || value === 'hard') return value;
    return 'medium';
  }

  private tokenize(text: string): Set<string> {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 2),
    );
  }

  private jaccard(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    let intersection = 0;
    for (const token of a) {
      if (b.has(token)) intersection++;
    }
    const union = a.size + b.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }
}
