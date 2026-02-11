import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SubmitTextDto } from './dto/submit-text.dto';
import type { Request } from 'express';

@Controller('submissions')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * POST /api/submissions/submit
   * Submit a text answer for a task
   */
  @Post('submit')
  async submitText(@Req() req: Request, @Body() dto: SubmitTextDto) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    
    const userId = req.user.userId;
    return this.submissionService.submitText(userId, dto);
  }

  /**
   * GET /api/submissions/me
   * Get all submissions for the authenticated user
   */
  @Get('me')
  async getMySubmissions(@Req() req: Request) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    
    const userId = req.user.userId;
    return this.submissionService.getUserSubmissions(userId);
  }

  /**
   * GET /api/submissions/:id
   * Get details of a specific submission
   */
  @Get(':id')
  async getSubmission(@Req() req: Request, @Param('id') id: string) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    
    const userId = req.user.userId;
    return this.submissionService.getSubmissionById(Number(id), userId);
  }

  /**
   * POST /api/submissions/:id/resubmit
   * Resubmit a rejected answer
   */
  @Post(':id/resubmit')
  async resubmit(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('textContent') textContent: string,
  ) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    
    const userId = req.user.userId;
    return this.submissionService.resubmit(Number(id), userId, textContent);
  }
}