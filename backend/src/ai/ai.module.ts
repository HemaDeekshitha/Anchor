import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { AiExtractionService } from './ai.extraction.service'; // add
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [GeminiService, AiExtractionService],          // add
  exports: [GeminiService, AiExtractionService],             // add
})
export class AiModule {}