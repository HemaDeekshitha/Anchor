import { Injectable } from '@nestjs/common';
import axios from 'axios';

type GeminiEmbeddingResponse = {
  embedding?: { values?: number[] };
};

@Injectable()
export class EmbeddingService {
  async createEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await axios.post<GeminiEmbeddingResponse>(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
      {
        content: {
          parts: [{ text }],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
      },
    );

    const embedding = response.data.embedding?.values || [];
    return embedding.slice(0, 1536);
  }
}
