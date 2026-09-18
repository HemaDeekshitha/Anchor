import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

type CommunityMediaResourceType = 'image' | 'video' | 'audio' | 'file';

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
    resourceType: CommunityMediaResourceType,
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
    resourceType: CommunityMediaResourceType,
  ): Promise<UploadApiResponse> {
    if (!providerAssetId.startsWith(`${this.folder}/${userId}/`)) {
      throw new BadRequestException('Media asset ownership is invalid');
    }
    const providerResourceType =
      resourceType === 'audio'
        ? 'video'
        : resourceType === 'file'
          ? 'raw'
          : resourceType;
    let result: UploadApiResponse;
    try {
      result = (await cloudinary.api.resource(providerAssetId, {
        resource_type: providerResourceType,
        type: 'authenticated',
      })) as UploadApiResponse;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Media asset is unavailable';
      throw new BadRequestException(
        message.includes('not found') || message.includes('404')
          ? 'Uploaded media was not found. Please try uploading again.'
          : 'Could not verify uploaded media. Please try again.',
      );
    }
    if (resourceType === 'file') {
      const allowedFormats = new Set([
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'txt',
        'csv',
        'rtf',
        'zip',
      ]);
      const format = String(
        result.format ?? providerAssetId.split('.').pop() ?? '',
      ).toLowerCase();
      if (!allowedFormats.has(format)) {
        throw new BadRequestException('Document format is not supported');
      }
    }
    const maxBytes =
      resourceType === 'video'
        ? 50_000_000
        : resourceType === 'audio'
          ? 20_000_000
          : resourceType === 'file'
            ? 25_000_000
            : 10_000_000;
    if (Number(result.bytes ?? 0) > maxBytes) {
      throw new BadRequestException('Media file is too large');
    }
    return result;
  }
  // T: O(1) provider request and S: O(1)

  createDeliveryUrl(
    providerAssetId: string,
    resourceType: CommunityMediaResourceType,
  ): string {
    const providerResourceType =
      resourceType === 'audio'
        ? 'video'
        : resourceType === 'file'
          ? 'raw'
          : resourceType;
    return cloudinary.url(providerAssetId, {
      resource_type: providerResourceType,
      type: 'authenticated',
      sign_url: true,
      secure: true,
      // Long enough for an open chat session without mid-scroll broken media.
      expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
      format:
        resourceType === 'video'
          ? 'mp4'
          : resourceType === 'audio'
            ? 'mp3'
            : undefined,
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
          : resourceType === 'video' || resourceType === 'audio'
            ? [{ quality: 'auto' }]
            : undefined,
    });
  }
  // T: O(1) and S: O(1)

  /** First-frame thumbnail so mobile clients are not stuck on a black video tile. */
  createVideoPosterUrl(providerAssetId: string): string {
    return cloudinary.url(providerAssetId, {
      resource_type: 'video',
      type: 'authenticated',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
      format: 'jpg',
      transformation: [
        { start_offset: '0' },
        { quality: 'auto', width: 1280, crop: 'limit' },
      ],
    });
  }
  // T: O(1) and S: O(1)
}
