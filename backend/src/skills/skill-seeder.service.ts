import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Skill } from './skills.entity';
import { SKILLS_DATA } from './data/skills.seed';
import { EmbeddingService } from 'src/ai/embedding.service';

@Injectable()
export class SkillSeederService implements OnModuleInit {
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
        const embedding = await this.embeddingService.createEmbedding(
          skill.name,
        );

        skill.embedding = embedding;

        await this.skillRepo.save(skill);
      }
    }

    console.log('Embedding generation completed');
  }
}
