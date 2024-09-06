import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateInvestmentDto {
  @IsNotEmpty({ message: 'Amount must not be empty' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;
}
