import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';  // ← changed
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('steps')
  getSteps() {
    return this.onboardingService.getSteps();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('answers')
  @UseInterceptors(
    FileFieldsInterceptor([          // ← changed
      { name: 'resume', maxCount: 1 },
      { name: 'profilePhoto', maxCount: 1 },
    ]),
  )
  async submitAnswers(
    @UploadedFiles() files: { resume?: Express.Multer.File[]; profilePhoto?: Express.Multer.File[] },  // ← changed
    @Body('answers') answers: string,
    @Req() req: Request,
    @Body('resumeText') resumeText?: string,
    @Body('location') location?: string,             // ← new
    @Body('yearsOfExperience') yearsOfExperience?: string,  // ← new
  ) {
    const userId = (req.user as any).userId;
    return this.onboardingService.saveAnswers(
      userId,
      files?.resume?.[0],            // ← changed
      answers,
      resumeText,
      files?.profilePhoto?.[0],      // ← new
      location,
      yearsOfExperience,
    );
  }
}