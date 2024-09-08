/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Request } from 'express';
import {
  Controller,
  Body,
  Post,
  Req,
  UseGuards,
  Param,
  HttpException,
  Get,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get user investments' })
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
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description:
      'Filter by status: "activated" or "deactivated" (default is all)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return user investments',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status option. Use "activated" or "deactivated"',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 422,
    description: 'User deactivated',
  })
  async getInvestments(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: 'activated' | 'deactivated',
  ) {
    const { user: userId } = req;
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

  @ApiOperation({ summary: 'Get user investment by id' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'Investment id',
  })
  @ApiResponse({
    status: 200,
    description: 'Return investment by id',
  })
  @ApiResponse({
    status: 400,
    description: 'User id is required',
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
    description: 'User deactivated',
  })
  @Get(':id')
  async getInvestment(@Param('id') id: number, @Req() req: Request) {
    const { user: userId } = req;

    if (!id) {
      throw new HttpException('User id is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.investmentService.getInvestmentById(id, userId);
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new investment' })
  @ApiResponse({
    status: 201,
    description: 'Investment created successfully',
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
    status: 422,
    description: 'User deactivated',
  })
  async createInvestment(
    @Req() req: Request,
    @Body() investment: CreateInvestmentDto,
  ) {
    const { user: userId } = req;
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
