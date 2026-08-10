export type EvalType =
  | 'star'
  | 'concept'
  | 'design'
  | 'code_explanation'
  | 'leetcode'
  | 'general';

export type EvalDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Curated document for RAG-only grading.
 * Rubrics mirror the criteria in GeminiService prompts.
 */
export interface EvalExemplar {
  id: string;
  evalType: EvalType;
  difficulty: EvalDifficulty;
  // Keywords used for lexical retrieval against task title/tags. 
  topics: string[];
  // Representative question this exemplar anchors. 
  questionPattern: string;
  // Checklist aligned with the live evaluation prompt criteria. 
  rubricChecklist: string[];
  // Condensed strong answer showing what “good” looks like. 
  strongExemplar: string;
  // Failure modes the grader should watch for in feedback. 
  weakSignals: string[];
  // Example feedback tone/specificity for strong vs weak answers. 
  feedbackAnchors: {
    strong: string;
    weak: string;
  };
}
