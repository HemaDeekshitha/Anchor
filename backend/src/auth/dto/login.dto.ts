import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;
}
