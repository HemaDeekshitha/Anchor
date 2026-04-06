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

  // optional for future (profile image)
  imageUrl?: string | null;
}
