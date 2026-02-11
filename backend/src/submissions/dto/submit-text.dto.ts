import { IsNumber, IsString, MinLength } from 'class-validator';

export class SubmitTextDto {
  @IsNumber()
  taskId: number;

  @IsString()
  @MinLength(10, { message: 'Answer must be at least 10 characters' })
  textContent: string;
}