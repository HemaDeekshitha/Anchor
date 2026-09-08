import { apiFetch } from './auth-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SubmitAnswerParams {
  taskId: number;
  taskDate?: string;
  textContent: string;
}

export interface SubmissionResult {
  id: number;
  taskId: number;
  taskTitle: string;
  category: string;
  status: 'approved' | 'rejected';
  score: number;
  feedback: string;
  approved: boolean;
  submittedAt: string;
  details: {
    hasSituation?: boolean;
    hasTask?: boolean;
    hasAction?: boolean;
    hasResult?: boolean;
    isSpecific?: boolean;
    selfReport?: boolean;
    wordCount?: number;
    passingScore?: number;
  };
  /** Anchor Points awarded for this submission (25 if approved, 0 if rejected) */
  anchorPointsEarned: number;
  /** User's total Anchor Points balance after this submission */
  newAnchorPointsBalance: number;
  trackCompletion?: {
    completedTrack: {
      id: string;
      durationMonths: 1 | 3 | 6;
      questionTarget: number;
      targetRole: string;
    };
    nextTrack: {
      id: string;
      durationMonths: 3 | 6;
      questionTarget: number | null;
    } | null;
    allTracksCompleted: boolean;
  } | null;
}

export interface MySubmission {
  id: number;
  taskId: number;
  taskTitle: string;
  category: string;
  status: 'approved' | 'rejected';
  score: number;
  feedback: string;
  approved: boolean;
  submittedAt: string;
}

/** Full task_submissions row returned by GET /submissions/:id */
export interface TaskSubmissionRecord {
  id: number;
  user_id: string;
  task_id: number;
  task?: { title?: string };
  submission_type: 'text' | 'screenshot';
  text_content: string;
  ai_result: {
    score: number;
    feedback: string;
    approved: boolean;
    confidence?: number;
    details?: SubmissionResult['details'];
  };
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  verified_at?: string | null;
  taskTitle?: string;
}

// ── Points ────────────────────────────────────────────────────────────────────

export interface PointsEntry {
  id: number;
  type:
    | 'task_earned'
    | 'converted_to_360'
    | 'streak_reward'
    | 'pending_overflow_penalty';
  amount: number;
  taskId: number | null;
  createdAt: string;
}

export interface PointsSummary {
  anchorPoints: number;
  points360: number;
  pointsToNextConversion: number;
  progressPercent: number;
  canConvert: boolean;
  history: PointsEntry[];
}

// ── API client ────────────────────────────────────────────────────────────────

export const api = {
  // Submit answer for a task
  submitAnswer: async (params: SubmitAnswerParams): Promise<SubmissionResult> => {
    const response = await apiFetch(`${API_BASE_URL}/submissions/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to submit answer');
    }

    return response.json();
  },

  // Get user's submission history
  getMySubmissions: async (): Promise<MySubmission[]> => {
    const response = await apiFetch(`${API_BASE_URL}/submissions/me`, {
      method: 'GET',
    });

    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },

  // Get specific submission details
  getSubmission: async (id: number): Promise<TaskSubmissionRecord> => {
    const response = await apiFetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'GET',
    });

    if (!response.ok) throw new Error('Failed to fetch submission');
    return response.json();
  },

  // Get current user's Anchor Points balance, history, and 360 Points count
  getMyPoints: async (): Promise<PointsSummary> => {
    const response = await apiFetch(`${API_BASE_URL}/points/me`, {
      method: 'GET',
    });

    if (!response.ok) throw new Error('Failed to fetch points');
    return response.json();
  },

  // Convert 500 Anchor Points → 1 "360 Point"
  convertTo360: async (): Promise<Omit<PointsSummary, 'history'>> => {
    const response = await apiFetch(`${API_BASE_URL}/points/convert`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Conversion failed');
    }

    return response.json();
  },
};
