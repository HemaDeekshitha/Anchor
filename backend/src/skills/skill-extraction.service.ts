import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skills.entity';

@Injectable()
export class SkillExtractionService {
  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
  ) {}

  async extractSkills(resumeText: string) {
    const skills = await this.skillRepo.find();

    const detectedSkills: Skill[] = [];

    const normalizedResume = resumeText
      .toLowerCase()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/•/g, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
      .replace(/([a-zA-Z])(\d)/g, '$1 $2') // split textNumber
      .replace(/(\d)([a-zA-Z])/g, '$1 $2') // split numberText
      .replace(/[ ]{2,}/g, ' ')
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replace(/\n{2,}/g, '\n')
      .trim();

    for (const skill of skills) {
      const skillName = skill.name.toLowerCase();

      if (normalizedResume.includes(skillName)) {
        detectedSkills.push(skill);
        continue;
      }

      if (skill.aliases) {
        for (const alias of skill.aliases) {
          if (normalizedResume.includes(alias.toLowerCase())) {
            detectedSkills.push(skill);
            break;
          }
        }
      }
    }

    return detectedSkills;
  }
}
