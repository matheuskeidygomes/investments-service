import { Module } from '@nestjs/common';
import PrismaModule from '../../prisma/prisma.module';
import InvestmentService from './services/investment.service';
import InvestmentController from './controllers/investment.controller';
import UsersModule from '../user/user.module';
import LoggerModule from '../../logger/logger.module';

@Module({
  imports: [PrismaModule, UsersModule, LoggerModule],
  controllers: [InvestmentController],
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export default class InvestmentModule {}
