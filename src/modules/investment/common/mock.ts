import { Investment } from '@prisma/client';

export const investmentData: Investment = {
  id: 1,
  amount: 1000,
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const investmentsData: Investment[] = [
  investmentData,
  { ...investmentData, id: 2, amount: 2000 },
  { ...investmentData, id: 3, amount: 3000 },
  { ...investmentData, id: 4, amount: 4000 },
  { ...investmentData, id: 5, amount: 5000 },
  { ...investmentData, id: 6, amount: 6000 },
  { ...investmentData, id: 7, amount: 7000 },
  { ...investmentData, id: 8, amount: 8000 },
  { ...investmentData, id: 9, amount: 9000 },
  { ...investmentData, id: 10, amount: 10000 },
];

export const newInvestmentData = {
  amount: investmentData.amount,
  userId: investmentData.userId,
};
