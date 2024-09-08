import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import PrismaService from '../../../prisma/services/prisma.service';
import UserService from '../../user/services/user.service';
import { Investment } from '@prisma/client';
import calculateInvestment from '../../../helpers/calculate';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export default class InvestmentService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async getUserInvestments(
    userId: number,
    page: number,
    limit: number,
    status?: string,
  ): Promise<Investment[]> {
    await this.userService.verifyUserIsActivatedOrThrow(userId);

    const cacheKey = `investments:user:${userId}page:${page}limit:${limit}status:${status}`;
    const cachedInvestments = await this.cacheManager.get<Investment[]>(
      cacheKey,
    );
    if (cachedInvestments) return cachedInvestments;

    const deletedFilter =
      status === 'activated'
        ? null
        : status === 'deactivated'
        ? { not: null }
        : undefined;

    let investments = await this.prisma.investment.findMany({
      where: {
        userId,
        deletedAt: deletedFilter,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    investments = investments.map((investment) => {
      return {
        ...investment,
        expectedBalance: calculateInvestment(investment),
      } as Investment;
    });

    await this.cacheManager.set(cacheKey, investments);

    return investments;
  }

  async getInvestmentById(id: number, userId: number): Promise<Investment> {
    await this.userService.verifyUserIsActivatedOrThrow(userId);

    const cacheKey = `investment:id:${id}:user:${userId}`;
    const cachedInvestment = await this.cacheManager.get<Investment>(cacheKey);
    if (cachedInvestment) return cachedInvestment;

    const investment = await this.prisma.investment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!investment) {
      throw new HttpException('Investment not found', HttpStatus.NOT_FOUND);
    }

    await this.cacheManager.set(cacheKey, investment);

    return {
      ...investment,
      expectedBalance: calculateInvestment(investment),
    } as Investment;
  }

  async createInvestment(
    data: Investment,
    userId: number,
  ): Promise<Investment> {
    await this.userService.verifyUserIsActivatedOrThrow(userId);

    const { amount } = data;
    return await this.prisma.investment.create({
      data: {
        amount,
        userId,
      },
    });
  }

  async deactivateInvestment(id: number, userId: number): Promise<Investment> {
    await this.userService.verifyUserIsActivatedOrThrow(userId);

    const investment = await this.prisma.investment.findFirst({
      where: {
        id,
      },
    });

    if (!investment) {
      throw new HttpException('Investment not found', HttpStatus.NOT_FOUND);
    }
    if (investment.userId !== userId) {
      throw new HttpException(
        'You are not authorized to deactivate this investment',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (investment.deletedAt) {
      throw new HttpException(
        'Investment is already deactivated',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return await this.prisma.investment.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
