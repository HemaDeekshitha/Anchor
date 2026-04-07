export class MomentumProfileDto {
  name: string;
  email: string;
  createdAt?: Date;

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
  name?: string;
  email?: string; // ← add
  location?: string;
  primaryFocus?: string[];
  currentStatus?: string[];
  preferredRole?: string[];
  areasOfInterest?: string[];
  employmentType?: string[];
  resumeText?: string | null;
}
