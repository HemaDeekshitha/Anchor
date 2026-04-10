import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsIn(['Applied', 'Interview', 'Offer', 'Rejected'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
