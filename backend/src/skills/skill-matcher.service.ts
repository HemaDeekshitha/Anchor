import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Skill } from './skills.entity';
import { EmbeddingService } from '../ai/embedding.service';

@Injectable()
export class SkillMatcherService {
  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    private embeddingService: EmbeddingService,
  ) {}

  async findBestMatch(skillText: string): Promise<Skill | null> {
    const embedding = await this.embeddingService.createEmbedding(skillText);

    const vector = `[${embedding.join(',')}]`;

    const result = await this.skillRepo.query(
      `
      SELECT *,
      embedding <-> $1::vector AS distance
      FROM skills
      WHERE embedding IS NOT NULL
      ORDER BY embedding <-> $1::vector
      LIMIT 1
      `,
      [vector],
    );

    if (!result.length) return null;

    const bestMatch = result[0];

    if (bestMatch.distance > 0.45) return null;

    return bestMatch;
  }
}
