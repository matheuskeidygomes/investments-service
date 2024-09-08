import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import PrismaService from '../../../prisma/services/prisma.service';
import InvestmentService from '../../investment/services/investment.service';
import UserService from '../../user/services/user.service';
import { Withdrawal } from '@prisma/client';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import calculateInvestment from '../../../helpers/calculate';

@Injectable()
export default class WithdrawalService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly investmentService: InvestmentService,
    private readonly userService: UserService,
  ) {}

  async getWithdrawalsByUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<Withdrawal[]> {
    await this.userService.verifyUserIsActivatedOrThrow(userId);

    const cacheKey = `withdrawals:user:${userId}page:${page}limit:${limit}`;
    const cachedWithdrawals = await this.cacheManager.get<Withdrawal[]>(
      cacheKey,
    );
    if (cachedWithdrawals) return cachedWithdrawals;

    const withdrawals = await this.prisma.withdrawal.findMany({
      where: {
        userId,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    await this.cacheManager.set(cacheKey, withdrawals);

    return withdrawals;
  }

  async getWithdrawalById(id: number, userId: number): Promise<Withdrawal> {
    await this.userService.verifyUserIsActivatedOrThrow(userId);

    const cacheKey = `withdrawal:id:${id}:user:${userId}`;
    const cachedWithdrawal = await this.cacheManager.get<Withdrawal>(cacheKey);
    if (cachedWithdrawal) return cachedWithdrawal;

    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!withdrawal) {
      throw new HttpException('Withdrawal not found', HttpStatus.NOT_FOUND);
    }

    await this.cacheManager.set(cacheKey, withdrawal);

    return withdrawal;
  }

  async getWithdrawalByInvestmentId(
    investmentId: number,
    userId: number,
  ): Promise<Withdrawal> {
    await this.userService.verifyUserIsActivatedOrThrow(userId);

    const cacheKey = `withdrawal:investmentId:${investmentId}:user:${userId}`;
    const cachedWithdrawal = await this.cacheManager.get<Withdrawal>(cacheKey);
    if (cachedWithdrawal) return cachedWithdrawal;

    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: {
        investmentId,
        userId,
      },
    });

    if (!withdrawal) {
      throw new HttpException('Withdrawal not found', HttpStatus.NOT_FOUND);
    }

    await this.cacheManager.set(cacheKey, withdrawal);

    return withdrawal;
  }

  async createWithdrawal(
    investmentId: number,
    userId: number,
  ): Promise<Withdrawal> {
    const investment = await this.investmentService.deactivateInvestment(
      investmentId,
      userId,
    );

    if (!investment.deletedAt) {
      throw new HttpException(
        'Failed to withdraw investment',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return await this.prisma.withdrawal.create({
      data: {
        amount: calculateInvestment(investment),
        investmentId,
        userId,
      },
    });
  }
}
