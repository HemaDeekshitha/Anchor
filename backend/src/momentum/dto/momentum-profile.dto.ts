export class MomentumProfileDto {
  name: string;
  email: string;

  primaryFocus: string[];
  resumeName: string | null;

  resumeUrl: string | null;
  resumeText?: string | null;

  skills?: string[];

  // optional for future (profile image)
  imageUrl?: string | null;
}
