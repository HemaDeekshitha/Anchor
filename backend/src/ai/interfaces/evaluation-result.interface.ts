// backend/src/ai/interfaces/evaluation-result.interface.ts

export interface EvaluationResult {
  score: number;
  feedback: string;
  approved: boolean;
  confidence: number;
  details: {
    // Core evaluation details
    approved?: boolean;
    passingScore?: number;
    wordCount?: number;
    
    // STAR-specific
    hasSituation?: boolean;
    hasTask?: boolean;
    hasAction?: boolean;
    hasResult?: boolean;
    isSpecific?: boolean;
    
    // Concept-specific
    isAccurate?: boolean;
    coversKeyPoints?: boolean;
    hasExamples?: boolean;
    showsUnderstanding?: boolean;
    
    // System Design-specific
    hasComponents?: boolean;
    discussesTradeoffs?: boolean;
    considersScalability?: boolean;
    
    // Code explanation-specific
    explainsApproach?: boolean;
    mentionsComplexity?: boolean;
    
    // Self-report
    selfReport?: boolean;
    
    // Allow any additional properties AI might return
    [key: string]: any;
  };
}