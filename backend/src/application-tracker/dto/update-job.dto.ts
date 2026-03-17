import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateJobDto {
  @IsIn(['Applied', 'Interview', 'Offer', 'Rejected'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
