import {
  Controller,
  Post,
  Req,
  UseGuards,
  Param,
  HttpException,
  Get,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get user withdrawals' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number to fetch (default is 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items to fetch per page (default is 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return list of withdrawals',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 422,
    description: 'Deactivated user',
  })
  async getWithdrawals(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<Withdrawal[]> {
    const { user: userId } = req;
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
  @ApiOperation({ summary: 'Get user withdrawal by id' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'Withdrawal id',
  })
  @ApiResponse({
    status: 200,
    description: 'Return withdrawal details',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Withdrawal not found',
  })
  async getWithdrawalById(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<Withdrawal> {
    const { user: userId } = req;

    if (!id) {
      throw new HttpException(
        'Withdrawal id is required',
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
  @ApiOperation({ summary: 'Get user withdrawal by investment id' })
  @ApiParam({
    name: 'investmentId',
    required: true,
    type: Number,
    description: 'Investment id',
  })
  @ApiResponse({
    status: 200,
    description: 'Return withdrawal details',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Withdrawal not found',
  })
  async getWithdrawalByInvestmentId(
    @Param('investmentId') investmentId: number,
    @Req() req: Request,
  ): Promise<Withdrawal> {
    const { user: userId } = req;

    if (!investmentId) {
      throw new HttpException(
        'Investment id is required',
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
  @ApiOperation({ summary: 'Create a new withdrawal from an investment' })
  @ApiParam({
    name: 'investmentId',
    required: true,
    type: Number,
    description: 'Investment id',
  })
  @ApiResponse({
    status: 201,
    description: 'Withdraw created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Investment not found',
  })
  @ApiResponse({
    status: 422,
    description: 'Unprocessable entity',
  })
  async createWithdrawal(
    @Param('investmentId') investmentId: number,
    @Req() req: Request,
  ): Promise<Withdrawal> {
    const { user: userId } = req;

    if (!investmentId) {
      throw new HttpException(
        'Investment id is required',
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
