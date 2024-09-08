import { Module } from '@nestjs/common';
import PrismaModule from '../../prisma/prisma.module';
import WithdrawalService from './services/withdrawal.service';
import InvestmentModule from '../investment/investment.module';
import WithdrawalController from './controllers/withdrawal.controller';
import UsersModule from '../user/user.module';
import LoggerModule from '../../logger/logger.module';

@Module({
  imports: [PrismaModule, InvestmentModule, UsersModule, LoggerModule],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
  exports: [WithdrawalService],
})
export default class WithdrawalModule {}
