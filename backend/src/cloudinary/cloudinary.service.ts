import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'anchor-resumes' },
        (error: any, result?: UploadApiResponse) => {
          // FIX: Handle both error and undefined result safely
          if (error || !result) {
            return reject(error || new Error('Failed to upload to Cloudinary'));
          }

          // FIX: TypeScript knows result is defined now
          resolve(result.secure_url);
        },
      );

      // Send file buffer to Cloudinary stream
      upload.end(file.buffer);
    });
  }
}
