import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type {
  CommunityJoinPolicy,
  CommunityPostKind,
  CommunityVisibility,
} from '../entities/community.entities';

export class CreateCommunityDto {
  @IsString()
  @Length(3, 120)
  name: string;

  @IsString()
  @MaxLength(600)
  description = '';

  @IsIn(['public', 'private'])
  visibility: CommunityVisibility;

  @IsIn(['open', 'approval', 'invite_only'])
  joinPolicy: CommunityJoinPolicy;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  friendIds?: string[];
}

export class ListQueryDto {
  @IsOptional()
  @IsIn(['joined', 'discover'])
  scope?: 'joined' | 'discover';

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}

export class CreateInviteDto {
  @IsIn(['link', 'code', 'direct'])
  kind: 'link' | 'code' | 'direct';

  @IsOptional()
  @IsUUID()
  inviteeUserId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxUses = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(30 * 24 * 60)
  expiresInMinutes = 7 * 24 * 60;
}

export class AcceptInviteDto {
  @IsOptional()
  @IsString()
  @Length(20, 300)
  token?: string;

  @IsOptional()
  @IsString()
  @Length(6, 16)
  code?: string;
}

export class PollOptionDto {
  @IsString()
  @Length(1, 30)
  text: string;
}

export class CreatePollDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PollOptionDto)
  options: PollOptionDto[];

  @IsOptional()
  @IsBoolean()
  allowsMultiple = false;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class MediaReferenceDto {
  @IsString()
  @Length(3, 255)
  providerAssetId: string;

  @IsIn(['image', 'video'])
  resourceType: 'image' | 'video';
}

export class CreatePostDto {
  @IsIn(['text', 'media', 'poll'])
  kind: CommunityPostKind;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  body?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => MediaReferenceDto)
  media?: MediaReferenceDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePollDto)
  poll?: CreatePollDto;
}

export class UpdatePostDto {
  @IsString()
  @Length(1, 10_000)
  body: string;
}

export class VotePostDto {
  @Type(() => Number)
  @IsInt()
  @IsIn([-1, 0, 1])
  value: -1 | 0 | 1;
}

export class CreateCommentDto {
  @IsString()
  @Length(1, 4000)
  body: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}

export class VotePollDto {
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('4', { each: true })
  optionIds: string[];
}

export class SearchPeopleQueryDto {
  @IsString()
  @Length(2, 80)
  search: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  limit = 20;
}

export class MediaSignatureDto {
  @IsIn(['image', 'video'])
  resourceType: 'image' | 'video';
}

export class SendFriendRequestDto {
  @IsUUID()
  userId: string;
}

export class ResolveFriendRequestDto {
  @IsIn(['accepted', 'declined'])
  status: 'accepted' | 'declined';
}
