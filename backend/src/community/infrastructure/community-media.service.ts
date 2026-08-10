import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CommunityMediaService {
  private readonly folder: string;

  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
    this.folder = config.get<string>(
      'COMMUNITY_MEDIA_FOLDER',
      'anchor-community',
    );
  }
  // T: O(1) and S: O(1)

  createUploadSignature(
    userId: string,
    resourceType: 'image' | 'video',
  ): Record<string, string | number> {
    const timestamp = Math.floor(Date.now() / 1000);
    const publicIdPrefix = `${this.folder}/${userId}/`;
    const params = {
      timestamp,
      folder: publicIdPrefix,
      type: 'authenticated',
    };
    const apiSecret = cloudinary.config().api_secret;
    if (!apiSecret) throw new BadRequestException('Media storage unavailable');
    return {
      timestamp,
      folder: publicIdPrefix,
      type: 'authenticated',
      resourceType,
      cloudName: cloudinary.config().cloud_name ?? '',
      apiKey: cloudinary.config().api_key ?? '',
      signature: cloudinary.utils.api_sign_request(params, apiSecret),
    };
  }
  // T: O(1) and S: O(1)

  async verifyAsset(
    userId: string,
    providerAssetId: string,
    resourceType: 'image' | 'video',
  ): Promise<UploadApiResponse> {
    if (!providerAssetId.startsWith(`${this.folder}/${userId}/`)) {
      throw new BadRequestException('Media asset ownership is invalid');
    }
    const result = (await cloudinary.api.resource(providerAssetId, {
      resource_type: resourceType,
      type: 'authenticated',
    })) as UploadApiResponse;
    const maxBytes = resourceType === 'video' ? 50_000_000 : 10_000_000;
    if (Number(result.bytes ?? 0) > maxBytes) {
      throw new BadRequestException('Media file is too large');
    }
    return result;
  }
  // T: O(1) provider request and S: O(1)

  createDeliveryUrl(
    providerAssetId: string,
    resourceType: 'image' | 'video',
  ): string {
    return cloudinary.url(providerAssetId, {
      resource_type: resourceType,
      type: 'authenticated',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 15 * 60,
      format: resourceType === 'video' ? 'mp4' : undefined,
      transformation:
        resourceType === 'image'
          ? [
              {
                quality: 'auto',
                fetch_format: 'auto',
                width: 1600,
                crop: 'limit',
              },
            ]
          : [{ quality: 'auto' }],
    });
  }
  // T: O(1) and S: O(1)
}
