import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import { ONBOARDING_STEPS } from './onboarding.data';
import { InjectRepository } from '@nestjs/typeorm';
import { OnboardingResponse } from './onboarding.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User } from 'src/users/user.entity';
import { ResumeSkillProcessor } from 'src/skills/resume-skill.processor';
import { RagService } from 'src/rag/rag.service';
import { LearningTracksService } from 'src/learning-tracks/learning-tracks.service';

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
    private readonly learningTracksService: LearningTracksService,
  ) {}

  getSteps() {
    return {
      steps: ONBOARDING_STEPS,
    };
  }

  private looksLikeResume(text: string): boolean {
    const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
    if (normalized.length < 80) return false;
    const signals = [
      /\b(experience|employment|work history)\b/,
      /\b(education|university|college|degree)\b/,
      /\b(skills|technologies|tools)\b/,
      /\b(projects?|certifications?|achievements?)\b/,
      /\b(summary|objective|profile)\b/,
      /[\w.+-]+@[\w.-]+\.[a-z]{2,}/,
      /\b(20\d{2}|19\d{2})\b/,
    ];
    return signals.filter((signal) => signal.test(normalized)).length >= 2;
  }

  private async readResumeFile(file: Express.Multer.File): Promise<string> {
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (file.size > 10_000_000) {
      throw new BadRequestException('Resume must be smaller than 10 MB');
    }
    try {
      if (extension === 'pdf' && file.mimetype === 'application/pdf') {
        return (await pdf(file.buffer)).text;
      }
      if (
        extension === 'docx' &&
        file.mimetype ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        return (await mammoth.extractRawText({ buffer: file.buffer })).value;
      }
    } catch {
      throw new BadRequestException(
        'We could not read this file. Please upload a valid PDF or DOCX resume.',
      );
    }
    throw new BadRequestException('Please upload only a PDF or DOCX resume');
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

    const extractedResumeText = file
      ? await this.readResumeFile(file)
      : (resumeText?.trim() ?? '');
    if (!this.looksLikeResume(extractedResumeText)) {
      throw new BadRequestException(
        'This file does not appear to be a resume. Please upload a resume with sections such as experience, education, skills, or projects.',
      );
    }

    if (file) {
      resumeUrl = await this.cloudinary.uploadFile(file);
      resumeName = file.originalname;
    }
    if (profilePhotoFile) {
      profilePhotoUrl = await this.cloudinary.uploadImage(profilePhotoFile);
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

      resumeText: extractedResumeText,
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

    const planAnswer =
      (parsed['learning-plan']?.[0] as string | undefined) ?? '';
    const durationMatch = planAnswer.match(/^[136]/);
    if (durationMatch) {
      await this.learningTracksService.create(userId, {
        durationMonths: Number(durationMatch[0]) as 1 | 3 | 6,
      });
    }

    // Pre-generate day-1 tasks immediately so the dashboard is ready on first visit.
    // Fire-and-forget — don't block the onboarding response.
    this.ragService
      .getDailyTasks(userId)
      .catch((err) =>
        this.logger.error(
          `Failed to pre-generate day-1 tasks for ${userId}: ${err}`,
        ),
      );

    return {
      success: true,
      message: 'Onboarding data saved successfully',
      id: entry.id,
    };
  }
}
