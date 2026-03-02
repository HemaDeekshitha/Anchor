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
  /** Points awarded for this submission. 25 if approved, 0 if rejected.
   *  Only present on fresh submissions (submitText), not on history list. */
  anchorPointsEarned?: number;
  /** Running Anchor Points balance after this submission.
   *  Only present on fresh submissions (submitText), not on history list. */
  newAnchorPointsBalance?: number;
}