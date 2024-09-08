import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import UserService from '../../user/services/user.service';
import PrismaService from '../../../prisma/services/prisma.service';
import InvestmentService from './investment.service';
import { Cache } from '@nestjs/cache-manager';
import { CacheModule } from '@nestjs/cache-manager';
import { Investment } from '@prisma/client';
import { useContainer, validate } from 'class-validator';
import {
  investmentData,
  investmentsData,
  newInvestmentData,
} from '../common/mock';
import { userData } from '../../user/common/mock';
import calculateInvestment from '../../../helpers/calculate';
import { CreateInvestmentDto } from '../dtos/investment.dto';

describe('InvestmentService', () => {
  let userService: UserService;
  let prismaService: PrismaService;
  let investmentService: InvestmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        UserService,
        InvestmentService,
        {
          provide: PrismaService,
          useValue: {
            investment: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            user: {
              findFirst: jest.fn(),
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

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(investmentService).toBeDefined();
  });

  describe('getInvestments', () => {
    it('should return all user investments', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'findMany')
        .mockResolvedValue(investmentsData);

      const investments: Investment[] =
        await investmentService.getUserInvestments(userData.id, 1, 10);

      const investmentsDataWithBalance = investmentsData.map((investment) => {
        return {
          ...investment,
          expectedBalance: calculateInvestment(investment),
        } as Investment;
      });

      expect(investments.length).toBe(10);
      expect(investments).toEqual(investmentsDataWithBalance);
      expect(investments[0]).toEqual(investmentsDataWithBalance[0]);
      expect(investments[0]).toHaveProperty('expectedBalance');
    });

    it('should return user investment by id', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'findFirst')
        .mockResolvedValue(investmentData);

      const investment: Investment = await investmentService.getInvestmentById(
        1,
        userData.id,
      );

      const expectedBalance = calculateInvestment(investmentData);

      expect(investment).toHaveProperty('expectedBalance');
      expect(investment).toEqual({ ...investmentData, expectedBalance });
    });

    it('should throw error if user investment not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest.spyOn(prismaService.investment, 'findFirst').mockResolvedValue(null);

      const investment = async () => {
        await investmentService.getInvestmentById(1, userData.id);
      };
      await expect(investment).rejects.toThrowError(
        new HttpException('Investment not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if user is deactivated', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        ...userData,
        deletedAt: new Date(),
      });

      const investment = async () => {
        await investmentService.getInvestmentById(1, userData.id);
      };
      await expect(investment).rejects.toThrowError(
        new HttpException(
          'User is deactivated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });

  describe('createInvestment', () => {
    it('should create a new investment', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'create')
        .mockResolvedValue(investmentData);

      const investment: Investment = await investmentService.createInvestment(
        newInvestmentData as Investment,
        userData.id,
      );

      expect(investment).toEqual(investmentData);
    });

    it('should throw error if user is deactivated', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        ...userData,
        deletedAt: new Date(),
      });

      const investment = async () => {
        await investmentService.createInvestment(
          newInvestmentData as Investment,
          userData.id,
        );
      };
      await expect(investment).rejects.toThrowError(
        new HttpException(
          'User is deactivated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      const investment = async () => {
        await investmentService.createInvestment(
          newInvestmentData as Investment,
          userData.id,
        );
      };
      await expect(investment).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if amount is negative', async () => {
      const investment = new CreateInvestmentDto({ amount: -1000 });
      const errors = await validate(investment);

      expect(errors[0].constraints).toHaveProperty('isPositive');
      expect(errors[0].constraints.isPositive).toEqual(
        'Amount must be a positive number',
      );
    });

    it('should throw error if amount is zero', async () => {
      const investment = new CreateInvestmentDto({ amount: 0 });
      const errors = await validate(investment);

      expect(errors[0].constraints).toHaveProperty('min');
      expect(errors[0].constraints.min).toEqual('Amount must be at least 50');
    });

    it('should throw error if amount is empty', async () => {
      const investment = new CreateInvestmentDto({ amount: null });
      const errors = await validate(investment);

      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints.isNotEmpty).toEqual(
        'Amount must not be empty',
      );
    });
  });

  describe('deactivateInvestment', () => {
    it('should deactivate an investment', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'findFirst')
        .mockResolvedValue(investmentData);
      jest
        .spyOn(prismaService.investment, 'update')
        .mockResolvedValue({ ...investmentData, deletedAt: new Date() });

      const investment: Investment =
        await investmentService.deactivateInvestment(1, userData.id);

      expect(investment.deletedAt).not.toBeNull();
    });

    it('should throw error if user is deactivated', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        ...userData,
        deletedAt: new Date(),
      });

      const investment = async () => {
        await investmentService.deactivateInvestment(1, userData.id);
      };
      await expect(investment).rejects.toThrowError(
        new HttpException(
          'User is deactivated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });

    it('should throw error if user is not authorized', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'findFirst')
        .mockResolvedValue({ ...investmentData, userId: 2 });

      const investment = async () => {
        await investmentService.deactivateInvestment(1, userData.id);
      };
      await expect(investment).rejects.toThrowError(
        new HttpException(
          'You are not authorized to deactivate this investment',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should throw error if investment is already deactivated', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest
        .spyOn(prismaService.investment, 'findFirst')
        .mockResolvedValue({ ...investmentData, deletedAt: new Date() });

      const investment = async () => {
        await investmentService.deactivateInvestment(1, userData.id);
      };
      await expect(investment).rejects.toThrowError(
        new HttpException(
          'Investment is already deactivated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });

    it('should throw error if investment not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      jest.spyOn(prismaService.investment, 'findFirst').mockResolvedValue(null);

      const investment = async () => {
        await investmentService.deactivateInvestment(1, userData.id);
      };
      await expect(investment).rejects.toThrowError(
        new HttpException('Investment not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      const investment = async () => {
        await investmentService.deactivateInvestment(1, userData.id);
      };
      await expect(investment).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if user is deactivated', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        ...userData,
        deletedAt: new Date(),
      });

      const investment = async () => {
        await investmentService.deactivateInvestment(1, userData.id);
      };
      await expect(investment).rejects.toThrowError(
        new HttpException(
          'User is deactivated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });
});
