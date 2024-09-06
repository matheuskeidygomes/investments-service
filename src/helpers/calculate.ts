import { Investment } from '@prisma/client';
import {
  interestRate,
  lessThan12MonthsTax,
  lessThan24MonthsTax,
  moreThan24MonthsTax,
} from '../common/constants';

function calculateMonthsAge(createdAt: Date, currentDate?: Date) {
  const current = currentDate || new Date();
  const diff = current.getTime() - createdAt.getTime();
  return diff / (1000 * 60 * 60 * 24 * 30);
}

function calculateInvestmentAmount(
  amount: number,
  interestRate: number,
  createdAt: Date,
  currentDate?: Date,
) {
  const monthsAge = calculateMonthsAge(createdAt, currentDate);
  return amount * Math.pow(1 + interestRate, monthsAge);
}

function calculateTribute(amount: number, createdAt: Date, currentDate?: Date) {
  const monthsAge = calculateMonthsAge(createdAt, currentDate);
  const tax = calculateTax(monthsAge);
  const value = amount * tax;
  return amount - value;
}

function calculateTax(months: number) {
  if (months < 12) return lessThan12MonthsTax;
  if (months < 24) return lessThan24MonthsTax;
  return moreThan24MonthsTax;
}

export default function calculateInvestment(investment: Investment): number {
  const { amount, createdAt, deletedAt } = investment;
  const calculatedInvestment = calculateInvestmentAmount(
    amount,
    interestRate,
    createdAt,
    deletedAt,
  );
  let total = calculateTribute(calculatedInvestment, createdAt, deletedAt);
  total = total < 0 ? 0 : Number(total.toFixed(2));

  return total;
}
