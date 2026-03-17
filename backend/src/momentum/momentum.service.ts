import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/user.entity';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { MomentumProfileDto } from './dto/momentum-profile.dto';
import axios from 'axios';
import { Response } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserSkill } from 'src/skills/user-skills.entity';
import { Skill } from 'src/skills/skills.entity';

@Injectable()
export class MomentumService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(OnboardingResponse)
    private onboardingRepository: Repository<OnboardingResponse>,
    private cloudinaryService: CloudinaryService,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,

    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  async getProfile(userId: string): Promise<MomentumProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });
    const skills = await this.getUserSkills(userId);

    return {
      name: user?.name || '',
      email: user?.email || '',

      primaryFocus: onboarding?.primaryFocus ?? [],
      resumeName: onboarding?.resumeName ?? null,
      resumeUrl: onboarding?.resumeUrl ? '/momentum/resume' : null,
      resumeText: onboarding?.resumeText ?? null,
      status: onboarding?.currentStatus ?? [],
      preferredRoles: onboarding?.preferredRole ?? [],
      intrests: onboarding?.areasOfInterest ?? [],
      employmentType: onboarding?.employmentType ?? [],

      skills,
      //   imageUrl?: onboarding?.imageUrl ?? null;  // future: user profile image stored in cloudinary
    };
  }
  async streamResume(userId: string, res: Response) {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });

    if (!onboarding?.resumeUrl) {
      throw new NotFoundException('Resume not found');
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    const resumeUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${onboarding.resumeUrl}`;

    const file = await axios.get(resumeUrl, {
      responseType: 'stream',
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${onboarding.resumeName}"`,
    });

    file.data.pipe(res);
  }

  async getUserSkills(userId: string) {
    const skills = await this.userSkillRepository
      .createQueryBuilder('us')
      .innerJoin(Skill, 's', 's.id = us.skillId')
      .where('us.userId = :userId', { userId })
      .select(['s.name as name', 's.category as category'])
      .orderBy('s.category', 'ASC')
      .getRawMany();

    return skills;
  }
}
