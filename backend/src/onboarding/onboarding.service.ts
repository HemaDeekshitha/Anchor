import { Injectable } from '@nestjs/common';
import { ONBOARDING_STEPS } from './onboarding.data';
import { InjectRepository } from '@nestjs/typeorm';
import { OnboardingResponse } from './onboarding.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingResponse)
    private readonly repo: Repository<OnboardingResponse>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly cloudinary: CloudinaryService,
  ) {}

  getSteps() {
    return {
      steps: ONBOARDING_STEPS,
    };
  }
  async saveAnswers(
    userId: string,
    file: Express.Multer.File | undefined,
    answers: string,
    resumeText?: string,
  ) {
    let resumeUrl: string | undefined;
    let resumeName: string | undefined;

    if (file) {
      resumeUrl = await this.cloudinary.uploadFile(file);
      resumeName = file.originalname;
    }

    const parsed = answers ? JSON.parse(answers) : {};

    const entry = this.repo.create({
      userId,
      primaryFocus: parsed['primary-focus'] || null,
      currentStatus: parsed['current-status'] || null,
      preferredRole: parsed['preferred-role'] || null,
      areasOfInterest: parsed['areas-interest'] || null,
      employmentType: parsed['employment-type'] || null,

      resumeText: resumeText ?? null,
      resumeName,
      resumeUrl,
    });

    await this.repo.save(entry);
    await this.userRepo.update(userId, {
      onboardingCompleted: true,
    });

    return {
      success: true,
      message: 'Onboarding data saved successfully',
      id: entry.id,
    };
  }
}
