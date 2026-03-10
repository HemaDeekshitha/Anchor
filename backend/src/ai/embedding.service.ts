import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
  async createEmbedding(text: string): Promise<number[]> {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        content: {
          parts: [{ text }],
        },
      },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const embedding = response.data.embedding?.values || [];
    return embedding.slice(0, 1536);
  }
}
