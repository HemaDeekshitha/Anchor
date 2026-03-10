import { Injectable } from '@nestjs/common';
import axios from 'axios';
import pdf from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class ResumeExtractorService {
  async extractText(publicId: string, resumeName: string): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    // get extension from filename
    const extension = resumeName.split('.').pop()?.toLowerCase();

    const resumeUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`;

    const response = await axios.get(resumeUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    if (extension === 'pdf') {
      const data = await pdf(buffer);
      return data.text;
    }

    if (extension === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    throw new Error(`Unsupported file type: ${extension}`);
  }
}
