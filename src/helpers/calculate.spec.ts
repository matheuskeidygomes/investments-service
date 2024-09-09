import { Investment } from '@prisma/client';
import calculateInvestment from './calculate';

describe('calculateInvestment', () => {
  it('should calculate investment correctly for less than 12 months', () => {
    const investment = {
      amount: 1000,
      createdAt: new Date('2021-01-01'),
      deletedAt: new Date('2021-09-01'),
    };

    const result = calculateInvestment(investment as Investment);
    expect(Math.round(result)).toEqual(808);
  });

  it('should calculate investment correctly between 12 and 24 months', () => {
    const investment = {
      amount: 1000,
      createdAt: new Date('2021-01-01'),
      deletedAt: new Date('2022-08-01'),
    };

    const result = calculateInvestment(investment as Investment);
    expect(Math.round(result)).toEqual(899);
  });

  it('should calculate investment correctly for more than 24 months', () => {
    const investment = {
      amount: 1000,
      createdAt: new Date('2015-01-01'),
      deletedAt: new Date('2023-06-01'),
    };

    const result = calculateInvestment(investment as Investment);
    expect(Math.round(result)).toEqual(1435);
  });
});
