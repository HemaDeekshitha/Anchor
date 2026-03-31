import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingResponse } from './onboarding.entity';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User } from 'src/users/user.entity';
import { ResumeSkillProcessor } from 'src/skills/resume-skill.processor';
import { UserSkill } from 'src/skills/user-skills.entity';
import { Skill } from 'src/skills/skills.entity';
import { ResumeExtractorService } from 'src/resume/resume-extractor.service';
import { SkillExtractionService } from 'src/skills/skill-extraction.service';
import { SkillSeederService } from 'src/skills/skill-seeder.service';
import { AiSkillExtractorService } from 'src/skills/ai-skill-extractor.service';
import { EmbeddingService } from 'src/ai/embedding.service';
import { SkillsModule } from 'src/skills/skill.module';
import { RagModule } from 'src/rag/rag.module';

@Module({
  imports: [
    SkillsModule,
    RagModule,
    TypeOrmModule.forFeature([OnboardingResponse, User, UserSkill, Skill]),
  ],
  controllers: [OnboardingController],
  providers: [CloudinaryProvider, CloudinaryService, OnboardingService],
})
export class OnboardingModule {}
