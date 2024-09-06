import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import PrismaModule from '../prisma/prisma.module';
import AuthModule from '../modules/auth/auth.module';
import UserModule from '../modules/user/user.module';
import InvestmentModule from '../modules/investment/investment.module';
import WithdrawalModule from '../modules/withdrawal/withdrawal.module';
import { CacheModule } from '@nestjs/cache-manager';
// import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      max: 1000,
      ttl: 30000,
      // ttl: 30,
      // store: redisStore,
      // host: process.env.REDIS_HOST,
      // port: process.env.REDIS_PORT,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    InvestmentModule,
    WithdrawalModule,
  ],
})
export default class AppModule {}
