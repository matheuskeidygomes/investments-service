import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import IsEmailUnique from '../../user/constraints/isEmailUnique';
import NoSpaces from '../../user/constraints/noSpaces';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value.replace(/\s+/g, '').trim())
  name: string;

  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email must be a valid email' })
  @Transform(({ value }) => value.toLowerCase())
  @IsEmailUnique({ message: 'Email already exists' })
  email: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  @IsString({ message: 'Password must be a string' })
  @Transform(({ value }) => value.trim())
  @NoSpaces({ message: 'Password should not contain spaces' })
  password: string;

  constructor(partial: Partial<RegisterDto>) {
    Object.assign(this, partial);
  }
}

export class LoginDto {
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email must be a valid email' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @Transform(({ value }) => value.trim())
  password: string;

  constructor(partial: Partial<LoginDto>) {
    Object.assign(this, partial);
  }
}
