import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MomentumController } from './momentum.controller';
import { MomentumService } from './momentum.service';

import { User } from '../users/user.entity';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserSkill } from 'src/skills/user-skills.entity';
import { Skill } from 'src/skills/skills.entity';
import { SkillsModule } from 'src/skills/skill.module';
import { UserDailyTask } from 'src/rag/rag-daily-user-tasks.entity';
import { RagTask } from 'src/rag/rag-task.entity';
import { TaskSubmission } from 'src/submissions/submission.entity';
import { GeminiService } from 'src/ai/gemini.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      OnboardingResponse,
      UserSkill,
      Skill,
      UserDailyTask,
      RagTask,
      TaskSubmission,
    ]),
    SkillsModule,
  ],
  controllers: [MomentumController],
  providers: [
    MomentumService,
    CloudinaryProvider,
    CloudinaryService,
    GeminiService,
  ],
})
export class MomentumModule {}
