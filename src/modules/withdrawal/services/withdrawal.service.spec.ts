import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import UserService from '../../user/services/user.service';
import PrismaService from '../../../prisma/services/prisma.service';
import InvestmentService from '../../investment/services/investment.service';
import { Cache } from '@nestjs/cache-manager';
import { CacheModule } from '@nestjs/cache-manager';
import { useContainer } from 'class-validator';
import {
  withdrawalData,
  withdrawalsData,
  newWithdrawalData,
} from '../common/mock';
import { investmentData } from '../../investment/common/mock';
import { userData } from '../../user/common/mock';
import WithdrawalService from './withdrawal.service';
import { Withdrawal } from '@prisma/client';

describe('WithdrawalService', () => {
  let userService: UserService;
  let prismaService: PrismaService;
  let investmentService: InvestmentService;
  let withdrawalsService: WithdrawalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        UserService,
        PrismaService,
        InvestmentService,
        WithdrawalService,
        {
          provide: PrismaService,
          useValue: {
            withdrawal: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
            user: {
              findFirst: jest.fn(),
            },
            investment: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: Cache,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    investmentService = module.get<InvestmentService>(InvestmentService);
    withdrawalsService = module.get<WithdrawalService>(WithdrawalService);

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(investmentService).toBeDefined();
    expect(withdrawalsService).toBeDefined();
  });

  describe('getWithdrawals', () => {
    it('should return all user withdrawals', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.withdrawal, 'findMany')
        .mockResolvedValue(withdrawalsData);

      const withdrawals = await withdrawalsService.getWithdrawalsByUser(
        userData.id,
        1,
        10,
      );

      expect(withdrawals.length).toBe(10);
      expect(withdrawals[0]).toEqual(withdrawalData);
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(
        withdrawalsService.getWithdrawalsByUser(userData.id, 1, 10),
      ).rejects.toThrowError();
    });

    it('should throw an error if user is not activated', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        ...userData,
        deletedAt: new Date(),
      });

      await expect(
        withdrawalsService.getWithdrawalsByUser(userData.id, 1, 10),
      ).rejects.toThrowError();
    });

    it('should return user withdrawal by id', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.withdrawal, 'findFirst')
        .mockResolvedValue(withdrawalData);

      const withdrawal = await withdrawalsService.getWithdrawalById(
        withdrawalData.id,
        userData.id,
      );

      expect(withdrawal).toEqual(withdrawalData);
    });

    it('should return user withdrawal by investment id', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.withdrawal, 'findFirst')
        .mockResolvedValue(withdrawalData);

      const withdrawal = await withdrawalsService.getWithdrawalByInvestmentId(
        withdrawalData.investmentId,
        userData.id,
      );

      expect(withdrawal).toEqual(withdrawalData);
    });
  });

  describe('createWithdrawal', () => {
    it('should create a new withdrawal', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'findFirst')
        .mockResolvedValue(investmentData);
      jest
        .spyOn(prismaService.investment, 'update')
        .mockResolvedValue({ ...investmentData, deletedAt: new Date() });
      jest
        .spyOn(prismaService.withdrawal, 'create')
        .mockResolvedValue(newWithdrawalData as Withdrawal);

      const withdrawal = await withdrawalsService.createWithdrawal(
        newWithdrawalData.investmentId,
        userData.id,
      );

      expect(withdrawal).toEqual(newWithdrawalData);
    });

    it('should throw an error if investment is not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest.spyOn(prismaService.investment, 'findFirst').mockResolvedValue(null);

      const withdrawal = async () => {
        return await withdrawalsService.createWithdrawal(
          newWithdrawalData.investmentId,
          userData.id,
        );
      };

      await expect(withdrawal).rejects.toThrowError(
        new HttpException('Investment not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if user is deactivated', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        ...userData,
        deletedAt: new Date(),
      });

      const withdrawal = async () => {
        return await withdrawalsService.createWithdrawal(
          newWithdrawalData.investmentId,
          userData.id,
        );
      };

      await expect(withdrawal).rejects.toThrowError(
        new HttpException(
          'User is deactivated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });

    it('should throw an error if investment is already withdrawn', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'findFirst')
        .mockResolvedValue({ ...investmentData, deletedAt: new Date() });

      const withdrawal = async () => {
        return await withdrawalsService.createWithdrawal(
          newWithdrawalData.investmentId,
          userData.id,
        );
      };

      await expect(withdrawal).rejects.toThrowError(
        new HttpException(
          'Investment is already deactivated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });

    it('should throw an error if withdrawal fails', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'findFirst')
        .mockResolvedValue(investmentData);
      jest
        .spyOn(prismaService.investment, 'update')
        .mockResolvedValue({ ...investmentData, deletedAt: null });

      const withdrawal = async () => {
        return await withdrawalsService.createWithdrawal(
          newWithdrawalData.investmentId,
          userData.id,
        );
      };

      await expect(withdrawal).rejects.toThrowError(
        new HttpException(
          'Failed to withdraw investment',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });

    it('should throw an error if user is not authorized to withdraw investment', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'findFirst')
        .mockResolvedValue({ ...investmentData, userId: 2 });

      const withdrawal = async () => {
        return await withdrawalsService.createWithdrawal(
          newWithdrawalData.investmentId,
          userData.id,
        );
      };

      await expect(withdrawal).rejects.toThrowError(
        new HttpException(
          'You are not authorized to deactivate this investment',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
  });
});
