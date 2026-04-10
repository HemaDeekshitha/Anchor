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
          // type: 'public', // 🔥 Makes the file NON-PUBLIC
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

  /**
   * Delete a previously uploaded image by its secure_url.
   * Extracts the public_id from the URL so we don't need to store it separately.
   */
  async deleteImage(secureUrl: string): Promise<void> {
    try {
      // e.g. https://res.cloudinary.com/CLOUD/image/upload/v123/anchor-avatars/abc.jpg
      // → public_id = "anchor-avatars/abc"
      const afterUpload = secureUrl.split('/upload/')[1];
      if (!afterUpload) return;
      const withoutVersion = afterUpload.replace(/^v\d+\//, '');
      const publicId = withoutVersion.replace(/\.[^/.]+$/, ''); // strip extension
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch {
      // Non-fatal — log and continue
    }
  }

  /** Upload an image (avatar, etc.) and return the full public secure_url. */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'anchor-avatars', resource_type: 'image' },
        (error: any, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(error || new Error('Failed to upload image to Cloudinary'));
          }
          resolve(result.secure_url);
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
      attachment: false, // ⭐ forces browser to open instead of download
    });

    return url;
  }
}
