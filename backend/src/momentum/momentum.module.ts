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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OnboardingResponse, UserSkill, Skill]),
  ],
  controllers: [MomentumController],
  providers: [MomentumService, CloudinaryProvider, CloudinaryService],
})
export class MomentumModule {}
