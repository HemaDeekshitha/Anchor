import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SkillExtractionService } from './skill-extraction.service';
import { ResumeExtractorService } from '../resume/resume-extractor.service';
import { AiSkillExtractorService } from './ai-skill-extractor.service';
import { UserSkill } from './user-skills.entity';
import { OnboardingResponse } from 'src/onboarding/onboarding.entity';

@Injectable()
export class ResumeSkillProcessor {
  private readonly logger = new Logger(ResumeSkillProcessor.name);

  constructor(
    @InjectRepository(UserSkill)
    private userSkillRepo: Repository<UserSkill>,

    @InjectRepository(OnboardingResponse)
    private onboardingRepo: Repository<OnboardingResponse>,

    private skillExtractionService: SkillExtractionService,
    private resumeExtractor: ResumeExtractorService,
    private aiSkillExtractorService: AiSkillExtractorService,
  ) {}

  async processResume(onboarding: OnboardingResponse) {
    let resumeText = onboarding.resumeText;

    // If user uploaded file instead of text, extract it first
    if (!resumeText && onboarding.resumeUrl) {
      resumeText = await this.resumeExtractor.extractText(
        onboarding.resumeUrl!,
        onboarding.resumeName!,
      );
    }

    if (!resumeText) return;

    // ── 1. AI keyword extraction ─────────────────────────────────────────────
    // Extract ALL keywords from the resume: role, technologies, tools,
    // cloud services, domain concepts, certifications, etc.
    // Stored in resumeKeywords and used directly by task generation.
    let resumeKeywords: string[] = [];
    try {
      resumeKeywords = await this.aiSkillExtractorService.extractKeywords(resumeText);
    } catch (err) {
      this.logger.warn('AI keyword extraction failed — proceeding without keywords');
    }

    // Save extracted keywords to the onboarding record
    if (resumeKeywords.length > 0) {
      await this.onboardingRepo.update(onboarding.id, { resumeKeywords });
      this.logger.log(`Saved ${resumeKeywords.length} keywords for user ${onboarding.userId}`);
    }

    // ── 2. Deterministic catalog matching (for profile skills display) ───────
    // This never calls Gemini and shows skills in the profile UI.
    const catalogSkills = await this.skillExtractionService.extractSkills(resumeText);

    await this.userSkillRepo.delete({ userId: onboarding.userId, source: 'resume' });

    for (const skill of catalogSkills) {
      await this.userSkillRepo.upsert(
        {
          userId: onboarding.userId,
          skillId: skill.id,
          skillName: skill.name,
          source: 'resume',
          confidence: 1,
        },
        ['userId', 'skillId'],
      );
    }
  }
}