import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}
  @Get('steps')
  getSteps() {
    return this.onboardingService.getSteps();
  }

  @Post('answers')
  @UseInterceptors(FileInterceptor('resume'))
  submitAnswers(
    @UploadedFile() file: Express.Multer.File,
    @Body('answers') answers: string,
  ) {
    return this.onboardingService.saveAnswers(file, answers);
  }
}
