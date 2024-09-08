import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import IsEmailUnique from '../constraints/isEmailUnique';
import { Transform } from 'class-transformer';
import NoSpaces from '../constraints/noSpaces';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email must be a valid email' })
  @Transform(({ value }) => value.toLowerCase())
  @IsEmailUnique({ message: 'Email already exists' })
  email: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Name must not be empty' })
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value.replace(/\s+/g, '').trim())
  name: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Password must not be empty' })
  @IsString({ message: 'Password must be a string' })
  @NoSpaces({ message: 'Password should not contain spaces' })
  @Transform(({ value }) => value.trim())
  password: string;

  constructor(partial: Partial<UpdateUserDto>) {
    Object.assign(this, partial);
  }
}
