/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Controller,
  Body,
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
import InvestmentService from '../services/investment.service';
import { CreateInvestmentDto } from '../dtos/investment.dto';
import { Investment } from '@prisma/client';
import LoggerService from '../../../logger/services/logger.service';

@ApiBearerAuth('JWT-auth')
@ApiTags('investment')
@UseGuards(JwtAuthGuard)
@Controller('investment')
export default class InvestmentController {
  constructor(
    private readonly investmentService: InvestmentService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  async getInvestments(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: 'activated' | 'deactivated',
  ) {
    const { user: userId } = req as any;
    const statusOptions = ['activated', 'deactivated'];

    if (status && !statusOptions.includes(status)) {
      throw new HttpException(
        'Invalid status option. Use activated or deactivated',
        HttpStatus.BAD_REQUEST,
      );
    }

    const pageNumber = page || 1;
    const limitNumber = limit || 10;

    try {
      return await this.investmentService.getUserInvestments(
        userId,
        pageNumber,
        limitNumber,
        status,
      );
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Get(':id')
  async getInvestment(@Param('id') id: number, @Req() req: Request) {
    const { user: userId } = req as any;

    if (!id) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.investmentService.getInvestmentById(id, userId);
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Post()
  async createInvestment(
    @Req() req: Request,
    @Body() investment: CreateInvestmentDto,
  ) {
    const { user: userId } = req as any;
    try {
      return await this.investmentService.createInvestment(
        investment as Investment,
        userId,
      );
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }
}
