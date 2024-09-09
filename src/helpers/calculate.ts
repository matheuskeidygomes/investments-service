import { Investment } from '@prisma/client';
import {
  interestRate,
  lessThan12MonthsTax,
  lessThan24MonthsTax,
  moreThan24MonthsTax,
} from '../common/constants';

function calculateMonthsAge(createdAt: Date, deletedAt?: Date) {
  const endDate = deletedAt || new Date();

  const startYear = createdAt.getFullYear();
  const startMonth = createdAt.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  const diffYear = endYear - startYear;
  const diffMonth = endMonth - startMonth;

  return diffYear * 12 + diffMonth;
}

function calculateIncome(amount: number, monthsAge: number) {
  return amount * Math.pow(1 + interestRate, monthsAge);
}

function calculateTribute(amount: number, monthsAge: number) {
  const tax = calculateTax(monthsAge);
  return amount * tax;
}

function calculateTax(months: number) {
  if (months < 12) return lessThan12MonthsTax;
  if (months < 24) return lessThan24MonthsTax;
  return moreThan24MonthsTax;
}

export default function calculateInvestment(investment: Investment): number {
  const { amount, createdAt, deletedAt } = investment;

  const monthsAge = calculateMonthsAge(createdAt, deletedAt);
  const calculatedIncome = calculateIncome(amount, monthsAge);
  const calculatedTribute = calculateTribute(calculatedIncome, monthsAge);

  const income = calculatedIncome - calculatedTribute;
  const res = income < 0 ? 0 : Number(income.toFixed(2));

  return res;
}
