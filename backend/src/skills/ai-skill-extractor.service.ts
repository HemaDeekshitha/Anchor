import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiSkillExtractorService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  async extractSkills(text: string): Promise<string[]> {
    console.log('AI skill extraction running...');

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = `
Extract technical skills from this resume.

Rules:
- Return ONLY a JSON array
- Do NOT include explanations
- Use short skill names
- Avoid duplicates
- Prefer common technology names

Example output:
["react","nodejs","aws","docker"]

Resume:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    const cleaned = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const skills = JSON.parse(cleaned);
      return skills;
    } catch (err) {
      console.log('AI returned invalid JSON:', cleaned);
      return [];
    }
  }
}
