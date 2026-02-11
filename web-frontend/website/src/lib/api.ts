const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SubmitAnswerParams {
  taskId: number;
  textContent: string;
}

interface SubmissionResult {
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
    wordCount?: number;
    [key: string]: any;
  };
}

interface Submission {
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

export const api = {
  // Submit answer for a task
  submitAnswer: async (params: SubmitAnswerParams): Promise<SubmissionResult> => {
    const response = await fetch(`${API_BASE_URL}/submissions/submit`, {
      method: 'POST',
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to submit answer');
    }

    return response.json();
  },

  // Get user's submission history
  getMySubmissions: async (): Promise<Submission[]> => {
    const response = await fetch(`${API_BASE_URL}/submissions/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }

    return response.json();
  },

  // Get specific submission details
  getSubmission: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch submission');
    }

    return response.json();
  },
};