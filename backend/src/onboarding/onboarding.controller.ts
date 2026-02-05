import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';

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
  @UseInterceptors(FileInterceptor('resume'))
  async submitAnswers(
    @UploadedFile() file: Express.Multer.File,
    @Body('answers') answers: string,
    @Req() req,
    @Body('resumeText') resumeText?: string,
  ) {
    const userId = req.user.userId;
    return this.onboardingService.saveAnswers(
      userId,
      file,
      answers,
      resumeText,
    );
  }
}
