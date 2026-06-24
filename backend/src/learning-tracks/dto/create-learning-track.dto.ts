import { IsIn } from 'class-validator';

export class CreateLearningTrackDto {
  @IsIn([1, 3, 6])
  durationMonths: 1 | 3 | 6;
}
