import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import UserService from '../services/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ name: 'isEmailUnique', async: true })
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.userService.getUserByEmail(email);
    return !user;
  }
}

export default function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEmailUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}
