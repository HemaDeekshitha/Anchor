import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skills.entity';


type SkillPhrase = {
  tokens: string[];
  skill: Skill;
};

@Injectable()
export class SkillExtractionService {
  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
  ) {}

  private phraseMatchesAt(
    resumeTokens: string[],
    phraseTokens: string[],
    start: number,
    consumed: boolean[],
  ): boolean {
    const len = phraseTokens.length;
  
    // not enough tokens left
    if (start + len > resumeTokens.length) return false;
  
    for (let j = 0; j < len; j++) {
      // already used by a previous match
      if (consumed[start + j]) return false;
  
      // token mismatch
      if (resumeTokens[start + j] !== phraseTokens[j]) return false;
    }
  
    return true;
  }

  private normalize(resumeText: string): string {
    return resumeText
      .toLowerCase()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/•/g, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
      .replace(/\b3d\b/gi, '__TOK3D__')
      .replace(/\b2d\b/gi, '__TOK2D__')
      .replace(/\b4d\b/gi, '__TOK4D__')
      .replace(/\bk8s\b/gi, '__TOKK8S__') // protected tokens
      .replace(/([a-zA-Z])(\d)/g, '$1 $2') // split textNumber
      .replace(/(\d)([a-zA-Z])/g, '$1 $2') // split numberText
      .replace(/engineers/gi, 'engineer')
      .replace(/__TOK3D__/gi, '3d')
      .replace(/__TOK2D__/gi, '2d')
      .replace(/__TOK4D__/gi, '4d')
      .replace(/__TOKK8S__/gi, 'k8s')
      .replace(/[ ]{2,}/g, ' ')
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replace(/\n{2,}/g, '\n')
      .trim();
  }

  private toTokens(text: string): string[] {
    return this.normalize(text)
    .split(/\s+/)
    .map((t) => t.replace(/[,.;:!?\-–—]+$/, ''))  // trailing punct/hyphens/dashes
    .map((t) => t.replace(/^[([{"']+|[)\]}"']+$/, ''))  // leading/trailing brackets
    .filter((t) => t.length > 0);
  }

  async extractSkills(resumeText: string) {
    
    const skills = await this.skillRepo.find();

    const resumeTokens = this.toTokens(resumeText);

    const phrases: SkillPhrase[] = [];

    for (const skill of skills) {
      const variants = [skill.name, ...(skill.aliases ?? [])];
      for (const variant of variants) {
        const tokens = this.toTokens(variant);
        phrases.push({ tokens, skill });
      }
    }

    phrases.sort((a, b) => {
      if (b.tokens.length !== a.tokens.length) {
        return b.tokens.length - a.tokens.length;  // more tokens wins
      }
      return b.tokens.join(' ').length - a.tokens.join(' ').length;  // tiebreaker
    });

    const consumed = new Array(resumeTokens.length).fill(false);
    const matchedById = new Map<number, Skill>();

    for (let i = 0; i < resumeTokens.length; i++) {
      if (consumed[i]) continue;

      for (const { tokens, skill } of phrases) {
        if (!this.phraseMatchesAt(resumeTokens, tokens, i, consumed)) {
          continue;
        }

        matchedById.set(skill.id, skill);

        for (let j = i; j < i + tokens.length; j++) {
          consumed[j] = true;
        }

        break;
      }
    }

    return [...matchedById.values()];
  }
}
