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
import { ResumeSkillProcessor } from 'src/skills/resume-skill.processor';
import { UserDailyTask } from 'src/rag/rag-daily-user-tasks.entity';
import { RagTask } from 'src/rag/rag-task.entity';
import { TaskSubmission } from 'src/submissions/submission.entity';

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

    private readonly resumeSkillProcessor: ResumeSkillProcessor,
    @InjectRepository(UserDailyTask)
    private readonly userDailyRepo: Repository<UserDailyTask>,

    @InjectRepository(RagTask)
    private ragTaskRepo: Repository<RagTask>,
    @InjectRepository(TaskSubmission)
    private taskSubmissionRepo: Repository<TaskSubmission>,
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
      createdAt: user?.createdAt,

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

  async resyncSkills(userId: string): Promise<{ count: number }> {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding data not found');
    }

    await this.resumeSkillProcessor.processResume(onboarding);
    const skills = await this.getUserSkills(userId);
    return { count: skills.length };
  }

  async getRecentSubmissions(userId: string) {
    const rows = await this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .leftJoin(
        (qb) =>
          qb
            .select('s.task_id', 'task_id')
            .addSelect("MAX((s.ai_result->>'score')::numeric)", 'best_score')
            .from(TaskSubmission, 's')
            .where('s.user_id = :subUserId', { subUserId: userId })
            .groupBy('s.task_id'),
        'best_sub',
        'best_sub.task_id = udt.task_id',
      )
      .select('udt.id', 'id')
      .addSelect('task.title', 'title')
      .addSelect('task.category', 'category')
      .addSelect('udt.task_date', 'createdAt')
      .addSelect('best_sub.best_score', 'score')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .orderBy('udt.task_date', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      category: r.category,
      createdAt: new Date(r.createdAt).toISOString(),
      score: r.score != null ? Number(r.score) : null,
    }));
  }
}
