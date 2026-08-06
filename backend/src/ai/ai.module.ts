import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { AiExtractionService } from './ai.extraction.service'; // add
import { ConfigModule } from '@nestjs/config';
import { EvalRagService } from './eval-rag/eval-rag.service';

@Module({
  imports: [ConfigModule],
  providers: [GeminiService, AiExtractionService, EvalRagService],
  exports: [GeminiService, AiExtractionService, EvalRagService],
})
export class AiModule {}
