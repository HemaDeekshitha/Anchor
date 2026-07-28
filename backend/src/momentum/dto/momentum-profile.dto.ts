import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class MomentumProfileDto {
  name: string;
  email: string;
  createdAt?: Date;
  location?: string | null;

  primaryFocus: string[];
  resumeName: string | null;

  resumeUrl: string | null;
  resumeText?: string | null;
  status: string[];
  employmentType?: string[];
  preferredRoles?: string[];
  intrests?: string[];

  skills?: string[];

  avatarUrl?: string | null;
}
// momentum-profile.dto.ts - add UpdateMomentumProfileDto
export class UpdateMomentumProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  primaryFocus?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  currentStatus?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  preferredRole?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  areasOfInterest?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  employmentType?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100_000)
  resumeText?: string | null;
}
