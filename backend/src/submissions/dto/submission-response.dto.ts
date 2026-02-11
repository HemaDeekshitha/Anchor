export class SubmissionResponseDto {
  id: number;
  taskId: number;
  taskTitle: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  score: number;
  feedback: string;
  approved: boolean;
  submittedAt: Date;
  details?: any;
}