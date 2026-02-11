import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { RagTask } from '../rag/rag-task.entity';
import { EvaluationResult } from './interfaces/evaluation-result.interface';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

 constructor(private configService: ConfigService) {
  const apiKey = this.configService.get<string>('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not defined in environment variables. ' +
      'Please add it to your .env file.'
    );
  }
  
  this.genAI = new GoogleGenerativeAI(apiKey);
  this.model = this.genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash' 
  });
}

  /**
   * Main method: Evaluates a user's submission based on task type
   * 
   * @param task - The task object from database (has title, category, etc.)
   * @param userAnswer - What the user submitted
   * @returns EvaluationResult with score, feedback, approval status
   */
  async evaluateSubmission(
    task: RagTask,
    userAnswer: string,
  ): Promise<EvaluationResult> {
    // Determine which type of evaluation to use based on task category
    const evaluationType = this.getEvaluationType(task.category);

    // Route to the appropriate evaluation method
    switch (evaluationType) {
      case 'star':
        return this.evaluateSTAR(task, userAnswer);
      case 'concept':
        return this.evaluateConcept(task, userAnswer);
      case 'design':
        return this.evaluateSystemDesign(task, userAnswer);
      case 'code_explanation':
        return this.evaluateCodeExplanation(task, userAnswer);
      default:
        return this.evaluateGeneral(task, userAnswer);
    }
  }

  /**
   * Maps task category to evaluation type
   * Different categories need different evaluation criteria
   */
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

  /**
   * Evaluates STAR format behavioral answers
   * Checks for Situation, Task, Action, Result structure
   */
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

  /**
   * Evaluates technical concept explanations
   * Checks for accuracy, completeness, understanding
   */
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

  /**
   * Evaluates system design explanations
   * Checks for components, scalability, trade-offs
   */
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

  /**
   * Evaluates code/algorithm explanations
   * Checks for approach, complexity analysis, understanding
   */
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

  /**
   * Generic evaluation for other task types
   */
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

  /**
   * Calls Gemini API and parses the JSON response
   * This is where we actually send the request to Google's AI
   */
private async callGeminiAndParse(
  prompt: string,
  difficulty: string,
): Promise<EvaluationResult> {
  try {
    // Send prompt to Gemini
    const result = await this.model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (Gemini might wrap it in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Determine if approved based on score and difficulty
    const passingScore = this.getPassingScore(difficulty);
    const approved = parsed.score >= passingScore;

    // ✅ FIX: Remove AI's approval from details, use our calculation
    // const { approved: _aiApproved, ...detailsWithoutApproval } = parsed;
    console.log('🤖 AI returned:', parsed.approved);
    console.log('✅ We calculated:', approved);
    console.log('📊 Score:', parsed.score, 'vs', passingScore);

    // Remove ALL occurrences of 'approved' from parsed object
    delete parsed.approved;

    // Return standardized result
    return {
      score: parsed.score,
      feedback: parsed.feedback,
      approved,  // ← Our calculated approval
      confidence: parsed.confidence || 0.8,
      details: {
        ...parsed,  // ← Details without conflicting approval
        approved,  // ← Add our calculated approval to details
        passingScore,  // ← Also include what score was needed
      },
    };
  } catch (error) {
    console.error('Gemini evaluation error:', error);
    
    // Fallback response if AI fails
    return {
      score: 0,
      feedback: 'Unable to evaluate submission. Please try again.',
      approved: false,
      confidence: 0,
      details: { approved: false },
    };
  }
}

  /**
   * Different passing scores based on difficulty
   * Easy tasks are more forgiving than hard tasks
   */
  private getPassingScore(difficulty: string): number {
    const scores: Record<string, number> = {
      easy: 6.0,
      medium: 7.0,
      hard: 8.0,
    };
    return scores[difficulty] || 6.0;
  }

  /**
   * Helper: Extract problem name from title
   * Example: "Solve LeetCode #1 Two Sum" → "Two Sum"
   */
  private extractProblemName(title: string): string {
    const match = title.match(/(?:#\d+\s)?(.+?)(?:\s*\(|$)/);
    return match ? match[1].trim() : title;
  }
}