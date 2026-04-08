import { Injectable, Logger } from '@nestjs/common';
import { ONBOARDING_STEPS } from './onboarding.data';
import { InjectRepository } from '@nestjs/typeorm';
import { OnboardingResponse } from './onboarding.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User } from 'src/users/user.entity';
import { ResumeSkillProcessor } from 'src/skills/resume-skill.processor';
import { RagService } from 'src/rag/rag.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectRepository(OnboardingResponse)
    private readonly repo: Repository<OnboardingResponse>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly cloudinary: CloudinaryService,
    private readonly resumeSkillProcessor: ResumeSkillProcessor,
    private readonly ragService: RagService,
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
    profilePhotoFile?: Express.Multer.File,  
    location?: string,                         
    yearsOfExperience?: string, 
  ) {
    let resumeUrl: string | undefined;
    let resumeName: string | undefined;
    let profilePhotoUrl: string | undefined; 

    if (file) {
      resumeUrl = await this.cloudinary.uploadFile(file);
      resumeName = file.originalname;
    }
    if (profilePhotoFile) {               
    profilePhotoUrl = await this.cloudinary.uploadFile(profilePhotoFile);
  }

    const parsed = answers ? JSON.parse(answers) : {};

    const preferredRoles: string[] | null = parsed['preferred-role'] || null;

    // The first selection on the "preferred role" question is the user's single
    // committed target role — everything else is supplementary context.
    const dedicatedRole = preferredRoles?.[0] ?? null;

    const entry = this.repo.create({
      userId,
      primaryFocus: parsed['primary-focus'] || null,
      currentStatus: parsed['current-status'] || null,
      preferredRole: preferredRoles,
      dedicatedRole,
      areasOfInterest: parsed['areas-interest'] || null,
      employmentType: parsed['employment-type'] || null,

      resumeText: resumeText ?? null,
      resumeName,
      resumeUrl,
      profileImageUrl: profilePhotoUrl,                       
      location: location ?? null,             
      yearsOfExperience: yearsOfExperience ?? null, 
    });

    await this.repo.save(entry);
    await this.resumeSkillProcessor.processResume(entry);
    await this.userRepo.update(userId, {
      onboardingCompleted: true,
    });

    // Pre-generate day-1 tasks immediately so the dashboard is ready on first visit.
    // Fire-and-forget — don't block the onboarding response.
    this.ragService.getDailyTasks(userId).catch((err) =>
      this.logger.error(`Failed to pre-generate day-1 tasks for ${userId}: ${err}`),
    );

    return {
      success: true,
      message: 'Onboarding data saved successfully',
      id: entry.id,
    };
  }
}
