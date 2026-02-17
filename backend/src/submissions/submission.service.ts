import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskSubmission } from './submission.entity';
import { RagTask } from '../rag/rag-task.entity';
import { UserDailyTask } from '../rag/rag-daily-user-tasks.entity';
import { GeminiService } from '../ai/gemini.service';
import { SubmitTextDto } from './dto/submit-text.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(TaskSubmission)
    private submissionRepo: Repository<TaskSubmission>,
    
    @InjectRepository(RagTask)
    private ragTaskRepo: Repository<RagTask>,
    
    @InjectRepository(UserDailyTask)
    private userDailyTaskRepo: Repository<UserDailyTask>,
    
    private geminiService: GeminiService,
  ) {}

  /**
   * Main method: Submit a text answer for evaluation
   * 
   * Flow:
   * 1. Fetch task details from database
   * 2. Call AI to evaluate the answer
   * 3. Save submission with AI result
   * 4. If approved, mark task as completed
   * 5. Return response to user
   */
  async submitText(userId: string, dto: SubmitTextDto) {
  // Fetch task details
  const task = await this.ragTaskRepo.findOne({ 
    where: { id: dto.taskId } 
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  // Category-based minimum character validation
  const selfReportCategories = [
    'Job Applications',
    'Networking',
    'Resume & LinkedIn',
    'Reflection & Planning',
    'Projects & Portfolio',
    'Interview Practice',
  ];

  const minChars = selfReportCategories.includes(task.category) ? 10 : 50;

  if (dto.textContent.trim().length < minChars) {
    throw new BadRequestException(
      `Answer must be at least ${minChars} characters long for ${task.category} tasks`
    );
  }

  // Rest of your existing code...
  let aiResult;
  
  if (selfReportCategories.includes(task.category)) {
    // Auto-approve self-report tasks
    aiResult = {
      score: 10,
      feedback: 'Task marked as complete. Great job!',
      approved: true,
      confidence: 1.0,
      details: { selfReport: true },
    };
  } else {
    // AI evaluation for learning tasks
    aiResult = await this.geminiService.evaluateSubmission(task, dto.textContent);
  }

  // Save submission
  const submission = this.submissionRepo.create({
    user_id: userId,
    task_id: dto.taskId,
    submission_type: 'text',
    text_content: dto.textContent,
    ai_result: aiResult,
    status: aiResult.approved ? 'approved' : 'rejected',
    submitted_at: new Date(),
    verified_at: new Date(),
  });

  await this.submissionRepo.save(submission);

  // Mark task as completed if approved
  if (aiResult.approved) {
    await this.markTaskCompleted(userId, dto.taskId, dto.taskDate);
  }

  return {
    id: submission.id,
    taskId: task.id,
    taskTitle: task.title,
    category: task.category,
    status: submission.status,
    score: aiResult.score,
    feedback: aiResult.feedback,
    approved: aiResult.approved,
    submittedAt: submission.submitted_at,
    details: aiResult.details,
  };
}

  /**
   * Mark task as completed in user_daily_tasks table
   * This integrates with the existing RAG system
   */
  private async markTaskCompleted(
    userId: string,
    taskId: number,
    taskDate?: string,
  ) {
    const completionDate = taskDate || new Date().toISOString().slice(0, 10);

    await this.userDailyTaskRepo.update(
      {
        user_id: userId,
        task_id: taskId,
        task_date: completionDate,
      },
      { status: 'completed' },
    );
  }

  /**
   * Get all submissions for a user
   * Shows their submission history
   */
  async getUserSubmissions(userId: string): Promise<SubmissionResponseDto[]> {
    const submissions = await this.submissionRepo
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.task', 'task')
      .where('sub.user_id = :userId', { userId })
      .orderBy('sub.submitted_at', 'DESC')
      .getMany();

    return submissions.map((sub) => ({
      id: sub.id,
      taskId: sub.task_id,
      taskTitle: sub.task.title,
      category: sub.task.category,
      status: sub.status,
      score: sub.ai_result.score,
      feedback: sub.ai_result.feedback,
      approved: sub.ai_result.approved,
      submittedAt: sub.submitted_at,
    }));
  }

  /**
   * Get details of a specific submission
   * Shows full answer + AI evaluation
   */
  async getSubmissionById(
    id: number,
    userId: string,
  ): Promise<TaskSubmission> {
    const submission = await this.submissionRepo.findOne({
      where: { id, user_id: userId },
      relations: ['task'],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  /**
   * Resubmit an answer (if rejected)
   * Allows users to try again
   */
  async resubmit(
    id: number,
    userId: string,
    newContent: string,
  ): Promise<SubmissionResponseDto> {
    const existing = await this.getSubmissionById(id, userId);

    if (existing.status === 'approved') {
      throw new BadRequestException('Cannot resubmit an approved answer');
    }

    // Create new submission (keep history)
    return this.submitText(userId, {
      taskId: existing.task_id,
      textContent: newContent,
    });
  }
}
