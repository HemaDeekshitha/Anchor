import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Skill } from './skills.entity';
import { UserSkill } from './user-skills.entity';
import { SkillSeederService } from './skill-seeder.service';
import { SkillExtractionService } from './skill-extraction.service';
import { AiSkillExtractorService } from './ai-skill-extractor.service';
import { ResumeSkillProcessor } from './resume-skill.processor';
import { SkillMatcherService } from './skill-matcher.service';
import { ResumeExtractorService } from 'src/resume/resume-extractor.service';
import { EmbeddingService } from 'src/ai/embedding.service';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, UserSkill])],
  providers: [
    SkillSeederService,
    SkillExtractionService,
    AiSkillExtractorService,
    ResumeSkillProcessor,
    SkillMatcherService,
    ResumeExtractorService,
    EmbeddingService,
  ],
  exports: [
    SkillSeederService,
    SkillExtractionService,
    AiSkillExtractorService,
    ResumeSkillProcessor,
    SkillMatcherService,
  ],
})
export class SkillsModule {}
