import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'NoSpaces' })
export class NoSpacesConstraint implements ValidatorConstraintInterface {
  async validate(password: string): Promise<boolean> {
    return !/\s/.test(password);
  }
}

export default function NoSpaces(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'NoSpaces',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NoSpacesConstraint,
    });
  };
}
