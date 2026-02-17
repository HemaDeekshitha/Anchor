import { IsDateString, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitTextDto {
  @IsNumber()
  taskId: number;

  @IsOptional()
  @IsDateString()
  taskDate?: string;

  @IsString()
  @MinLength(10, { message: 'Answer must be at least 10 characters' })
  textContent: string;
}
