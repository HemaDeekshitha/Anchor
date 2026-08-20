import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Skill } from './skills.entity';
import { SKILLS_DATA } from './data/skills.seed';
import { EmbeddingService } from 'src/ai/embedding.service';

@Injectable()
export class SkillSeederService implements OnModuleInit {
  private readonly logger = new Logger(SkillSeederService.name);

  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    private embeddingService: EmbeddingService,
  ) {}

  async onModuleInit() {
    console.log('Seeding skills...');

    // Normalize + prepare skills
    const preparedSkills = SKILLS_DATA.map((skill) => ({
      name: skill.name.toLowerCase(),
      category: skill.category,
      aliases: skill.aliases ?? [],
    }));

    // Remove duplicates from seed list
    const uniqueSkills = Array.from(
      new Map(preparedSkills.map((s) => [s.name, s])).values(),
    );

    // Insert or update skills
    await this.skillRepo.upsert(uniqueSkills, ['name']);

    // Fetch skills from DB
    const dbSkills = await this.skillRepo.find();

    // Generate embeddings
    for (const skill of dbSkills) {
      if (!skill.embedding) {
        try {
          const embedding = await this.embeddingService.createEmbedding(
            skill.name,
          );

          skill.embedding = embedding;

          await this.skillRepo.save(skill);
        } catch (error) {
          const status = axios.isAxiosError(error)
            ? error.response?.status
            : undefined;
          const responseData = axios.isAxiosError(error)
            ? (error.response?.data as
                | { error?: { message?: unknown } }
                | undefined)
            : undefined;
          const providerMessage =
            typeof responseData?.error?.message === 'string'
              ? responseData.error.message
              : error instanceof Error
                ? error.message
                : 'Unknown embedding error';
          this.logger.warn(
            `Embedding seeding paused${status ? ` (HTTP ${status})` : ''}: ${String(providerMessage)}`,
          );
          break;
        }
      }
    }

    console.log('Embedding generation completed');
  }
}
