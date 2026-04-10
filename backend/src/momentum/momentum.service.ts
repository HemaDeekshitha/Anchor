import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/user.entity';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import {
  MomentumProfileDto,
  UpdateMomentumProfileDto,
} from './dto/momentum-profile.dto';
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
      location: onboarding?.location ?? null,

      primaryFocus: onboarding?.primaryFocus ?? [],
      resumeName: onboarding?.resumeName ?? null,
      resumeUrl: onboarding?.resumeUrl ? '/momentum/resume' : null,
      resumeText: onboarding?.resumeText ?? null,
      status: onboarding?.currentStatus ?? [],
      preferredRoles: onboarding?.preferredRole ?? [],
      intrests: onboarding?.areasOfInterest ?? [],
      employmentType: onboarding?.employmentType ?? [],
      avatarUrl: onboarding?.profileImageUrl ?? null,

      skills,
    };
  }

  // ── NEW ─────────────────────────────────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateMomentumProfileDto) {
    if (dto.name !== undefined || dto.email !== undefined) {
      const userUpdate: Partial<User> = {};
      if (dto.name !== undefined) userUpdate.name = dto.name;
      if (dto.email !== undefined) userUpdate.email = dto.email;
      await this.userRepository.update(userId, userUpdate);
    }

    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });

    if (!onboarding) {
      const fresh = this.onboardingRepository.create({
        userId,
        primaryFocus: dto.primaryFocus ?? null,
        currentStatus: dto.currentStatus ?? null,
        preferredRole: dto.preferredRole ?? null,
        areasOfInterest: dto.areasOfInterest ?? null,
        employmentType: dto.employmentType ?? null,
        resumeText: dto.resumeText ?? null,
      });
      await this.onboardingRepository.save(fresh);
      return { success: true };
    }

    if (dto.primaryFocus !== undefined)
      onboarding.primaryFocus = dto.primaryFocus;
    if (dto.currentStatus !== undefined)
      onboarding.currentStatus = dto.currentStatus;
    if (dto.preferredRole !== undefined)
      onboarding.preferredRole = dto.preferredRole;
    if (dto.areasOfInterest !== undefined)
      onboarding.areasOfInterest = dto.areasOfInterest;
    if (dto.employmentType !== undefined)
      onboarding.employmentType = dto.employmentType;
    if (dto.resumeText !== undefined) onboarding.resumeText = dto.resumeText;
    if (dto.location !== undefined) {
      onboarding.location = dto.location?.trim() || null;
    } else if (!onboarding.location && dto.resumeText) {
      // Auto-extract location from pasted resume text
      const extracted = this.extractLocationFromResume(dto.resumeText);
      if (extracted) onboarding.location = extracted;
    }

    await this.onboardingRepository.save(onboarding);
    return { success: true };
  }

  /** Extracts a city/state or city/country location from raw resume text. */
  private extractLocationFromResume(text: string): string | null {
    if (!text) return null;
    // Match patterns like "Fremont, CA" / "New York, NY" / "Austin, Texas" / "London, UK"
    const match = text.match(
      /\b([A-Z][a-zA-Z\s]{1,20}),\s*([A-Z]{2}|[A-Z][a-zA-Z]{3,20})\b/,
    );
    return match ? match[0] : null;
  }

  async updateResume(userId: string, file: Express.Multer.File) {
    const resumeUrl = await this.cloudinaryService.uploadFile(file);
    const resumeName = file.originalname;

    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });

    if (onboarding) {
      onboarding.resumeUrl = resumeUrl;
      onboarding.resumeName = resumeName;
      onboarding.resumeText = null;
      await this.onboardingRepository.save(onboarding);
      await this.resumeSkillProcessor.processResume(onboarding);

      // Re-fetch to get the resumeText populated by the processor
      if (!onboarding.location) {
        const refreshed = await this.onboardingRepository.findOne({ where: { userId } });
        if (refreshed?.resumeText) {
          const loc = this.extractLocationFromResume(refreshed.resumeText);
          if (loc) {
            refreshed.location = loc;
            await this.onboardingRepository.save(refreshed);
          }
        }
      }
    } else {
      const fresh = this.onboardingRepository.create({
        userId,
        resumeUrl,
        resumeName,
        resumeText: null,
      });
      await this.onboardingRepository.save(fresh);
      await this.resumeSkillProcessor.processResume(fresh);
    }

    return { success: true, resumeName };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });

    // Delete previous avatar from Cloudinary before uploading new one
    if (onboarding?.profileImageUrl) {
      await this.cloudinaryService.deleteImage(onboarding.profileImageUrl);
    }

    const imageUrl = await this.cloudinaryService.uploadImage(file);

    if (onboarding) {
      onboarding.profileImageUrl = imageUrl;
      await this.onboardingRepository.save(onboarding);
    } else {
      const fresh = this.onboardingRepository.create({
        userId,
        profileImageUrl: imageUrl,
      });
      await this.onboardingRepository.save(fresh);
    }

    return { success: true, imageUrl };
  }

  async removeAvatar(userId: string) {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });

    if (onboarding?.profileImageUrl) {
      await this.cloudinaryService.deleteImage(onboarding.profileImageUrl);
      onboarding.profileImageUrl = null;
      await this.onboardingRepository.save(onboarding);
    }

    return { success: true };
  }
  // ────────────────────────────────────────────────────────────────────────────

  async streamResume(userId: string, res: Response) {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });

    if (!onboarding?.resumeUrl) {
      throw new NotFoundException('Resume not found');
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const resumeUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${onboarding.resumeUrl}`;

    const file = await axios.get(resumeUrl, { responseType: 'stream' });

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
    // Use DISTINCT ON to get the best submission per task (by score) in one query.
    // This avoids any extra round trips when the user expands a row in the UI.
    const rows = await this.userDailyRepo.query(
      `
      SELECT
        udt.id,
        task.title,
        task.category,
        udt.task_date AS "createdAt",
        best_sub.best_score AS score,
        best_sub.text_content AS answer,
        best_sub.feedback
      FROM user_daily_tasks udt
      INNER JOIN rag_tasks task ON task.id = udt.task_id
      LEFT JOIN (
        SELECT DISTINCT ON (s.task_id)
          s.task_id,
          s.text_content,
          (s.ai_result->>'score')::numeric AS best_score,
          s.ai_result->>'feedback' AS feedback
        FROM task_submissions s
        WHERE s.user_id::text = $1::text
        ORDER BY s.task_id, (s.ai_result->>'score')::numeric DESC
      ) best_sub ON best_sub.task_id = udt.task_id
      WHERE udt.user_id::text = $1::text
        AND udt.status = 'completed'
      ORDER BY udt.task_date DESC
      `,
      [userId],
    );

    return rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      category: r.category,
      createdAt: new Date(r.createdAt).toISOString(),
      score: r.score != null ? Number(r.score) : null,
      answer: r.answer ?? null,
      feedback: r.feedback ?? null,
    }));
  }
}
