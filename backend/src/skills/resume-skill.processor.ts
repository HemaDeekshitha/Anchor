import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SkillExtractionService } from './skill-extraction.service';
import { ResumeExtractorService } from '../resume/resume-extractor.service';
import { UserSkill } from './user-skills.entity';
import { OnboardingResponse } from 'src/onboarding/onboarding.entity';
import { AiSkillExtractorService } from './ai-skill-extractor.service';
import { Skill } from './skills.entity';
import { SkillMatcherService } from './skill-matcher.service';

@Injectable()
export class ResumeSkillProcessor {
  constructor(
    @InjectRepository(UserSkill)
    private userSkillRepo: Repository<UserSkill>,

    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,

    private skillExtractionService: SkillExtractionService,
    private resumeExtractor: ResumeExtractorService,
    private aiSkillExtractorService: AiSkillExtractorService,
    private skillMatcherService: SkillMatcherService,
  ) {}

  private normalizeSkillText(value: string): string {
    return value
      .toLowerCase()
      .replace(/\./g, '') // node.js → nodejs
      .replace(/[-_]/g, ' ') // next-js → next js
      .replace(/api(s)?/g, 'api') // apis → api
      .replace(/\s+/g, ' ')
      .trim();
  }

  async processResume(onboarding: OnboardingResponse) {
    let resumeText = onboarding.resumeText;

    // If user uploaded file instead of text
    if (!resumeText && onboarding.resumeUrl) {
      resumeText = await this.resumeExtractor.extractText(
        onboarding.resumeUrl!,
        onboarding.resumeName!,
      );
    }

    if (!resumeText) return;

    // 1) Deterministic / existing extractor
    const detectedSkills =
      await this.skillExtractionService.extractSkills(resumeText);

    // 2) AI extractor returns string skill names
    const aiSkills =
      await this.aiSkillExtractorService.extractSkills(resumeText);

    const normalizedAiSkills = aiSkills.map((skill) =>
      this.normalizeSkillText(skill),
    );

    // 3) Load all skills once and build lookup by name + aliases
    const allDbSkills = await this.skillRepo.find();

    const skillLookup = new Map<string, Skill>();

    for (const skill of allDbSkills) {
      // Match by canonical name

      skillLookup.set(this.normalizeSkillText(skill.name), skill);

      // Match by aliases if present
      if (Array.isArray(skill.aliases)) {
        for (const alias of skill.aliases) {
          skillLookup.set(this.normalizeSkillText(alias), skill);
        }
      }
    }

    // 4) Match AI skills to DB skills using name OR alias
    const aiMatchedSkills: Skill[] = [];
    for (const aiSkill of normalizedAiSkills) {
      // 1️⃣ fast exact/alias lookup
      let matchedSkill: Skill | null | undefined = skillLookup.get(aiSkill);

      // 2️⃣ if not found, use embedding matcher
      if (!matchedSkill) {
        matchedSkill = await this.skillMatcherService.findBestMatch(aiSkill);
      }

      if (!matchedSkill) continue;

      aiMatchedSkills.push(matchedSkill);
    }

    // 5) Combine detected skills + AI matched skills without duplicates
    const combinedSkills = new Map<number, Skill>();

    for (const skill of detectedSkills) {
      combinedSkills.set(skill.id, skill);
    }

    for (const skill of aiMatchedSkills) {
      combinedSkills.set(skill.id, skill);
    }

    const finalSkills = Array.from(combinedSkills.values());

    // 6) Save into user_skills
    // upsert + unique(userId, skillId) means no duplicates
    for (const skill of finalSkills) {
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
