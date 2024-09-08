import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateInvestmentDto {
  @IsNotEmpty({ message: 'Amount must not be empty' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Min(50, { message: 'Amount must be at least 50' })
  amount: number;

  constructor(partial: Partial<CreateInvestmentDto>) {
    Object.assign(this, partial);
  }
}
