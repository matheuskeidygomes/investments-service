import { Withdrawal } from '@prisma/client';

export const withdrawalData: Withdrawal = {
  id: 1,
  userId: 1,
  investmentId: 1,
  amount: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const withdrawalsData: Withdrawal[] = [
  withdrawalData,
  { ...withdrawalData, id: 2, userId: 2, investmentId: 2 },
  { ...withdrawalData, id: 3, userId: 3, investmentId: 3 },
  { ...withdrawalData, id: 4, userId: 4, investmentId: 4 },
  { ...withdrawalData, id: 5, userId: 5, investmentId: 5 },
  { ...withdrawalData, id: 6, userId: 6, investmentId: 6 },
  { ...withdrawalData, id: 7, userId: 7, investmentId: 7 },
  { ...withdrawalData, id: 8, userId: 8, investmentId: 8 },
  { ...withdrawalData, id: 9, userId: 9, investmentId: 9 },
  { ...withdrawalData, id: 10, userId: 10, investmentId: 10 },
];

export const newWithdrawalData = {
  investmentId: withdrawalData.investmentId,
  userId: withdrawalData.userId,
};
