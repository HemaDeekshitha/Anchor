import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  message?: string;
}
