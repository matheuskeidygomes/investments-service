import {
  Controller,
  Post,
  Req,
  UseGuards,
  Param,
  HttpException,
  Get,
  Request,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '../../auth/common/jwt.guard';
import WithdrawalService from '../services/withdrawal.service';
import { Withdrawal } from '@prisma/client';
import LoggerService from '../../../logger/services/logger.service';

@ApiBearerAuth('JWT-auth')
@ApiTags('withdrawal')
@UseGuards(JwtAuthGuard)
@Controller('withdrawal')
export default class WithdrawalController {
  constructor(
    private readonly withdrawalService: WithdrawalService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  async getWithdrawals(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<Withdrawal[]> {
    const { user: userId } = req as any;
    const pageNumber = page || 1;
    const limitNumber = limit || 10;
    try {
      return await this.withdrawalService.getWithdrawalsByUser(
        userId,
        pageNumber,
        limitNumber,
      );
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Get(':id')
  async getWithdrawalById(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<Withdrawal> {
    const { user: userId } = req as any;

    if (!id) {
      throw new HttpException(
        'Withdrawal ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.withdrawalService.getWithdrawalById(id, userId);
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('investment/:investmentId')
  async getWithdrawalByInvestmentId(
    @Param('investmentId') investmentId: number,
    @Req() req: Request,
  ): Promise<Withdrawal> {
    const { user: userId } = req as any;

    if (!investmentId) {
      throw new HttpException(
        'Investment ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.withdrawalService.getWithdrawalByInvestmentId(
        investmentId,
        userId,
      );
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('investment/:investmentId')
  async createWithdrawal(
    @Param('investmentId') investmentId: number,
    @Req() req: Request,
  ): Promise<Withdrawal> {
    const { user: userId } = req as any;

    if (!investmentId) {
      throw new HttpException(
        'Investment ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.withdrawalService.createWithdrawal(
        investmentId,
        userId,
      );
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }
}
