// import { Injectable } from '@nestjs/common';
// import { v2 as cloudinary } from 'cloudinary';
// import { UploadApiResponse } from 'cloudinary';

// @Injectable()
// export class CloudinaryService {
//   async uploadFile(file: Express.Multer.File): Promise<string> {
//     return new Promise((resolve, reject) => {
//       const upload = cloudinary.uploader.upload_stream(
//         { folder: 'anchor-resumes' },
//         (error: any, result?: UploadApiResponse) => {
//           // FIX: Handle both error and undefined result safely
//           if (error || !result) {
//             return reject(error || new Error('Failed to upload to Cloudinary'));
//           }

//           // FIX: TypeScript knows result is defined now
//           resolve(result.secure_url);
//         },
//       );

//       // Send file buffer to Cloudinary stream
//       upload.end(file.buffer);
//     });
//   }
// }

import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'anchor-resumes',
          resource_type: 'raw', // 🔥 PDFs/docs are non-image RAW files
          type: 'private', // 🔥 Makes the file NON-PUBLIC
        },
        (error: any, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(error || new Error('Failed to upload to Cloudinary'));
          }

          // 🔥 DO NOT return public secure_url
          // It won't work because private assets are not publicly accessible

          // Instead return the public_id so we can generate signed URLs later
          resolve(result.public_id);
        },
      );

      upload.end(file.buffer);
    });
  }

  // 🔥 Generate a signed URL valid for a limited time
  generatePrivateUrl(publicId: string) {
    const url = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'private',
      sign_url: true, // 🔥 Authenticated access
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    });

    return url;
  }
}
