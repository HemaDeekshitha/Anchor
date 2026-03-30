import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class ManualJobDto {
  @IsString()
  company: string;

  @IsString()
  role: string;

  @IsIn(['Applied', 'Interview', 'Offer', 'Rejected'])
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  appliedDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
