import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import PrismaModule from '../prisma/prisma.module';
import AuthModule from '../modules/auth/auth.module';
import UserModule from '../modules/user/user.module';
import InvestmentModule from '../modules/investment/investment.module';
import WithdrawalModule from '../modules/withdrawal/withdrawal.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import environment from '../config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [environment],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('cacheTimeout'),
        max: configService.get('cacheMaxSize'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => [
        {
          ttl: configService.get('requestTimeout'),
          limit: configService.get('requestPerMinute'),
          store: redisStore,
          host: configService.get('redisHost'),
          port: configService.get('redisPort'),
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    InvestmentModule,
    WithdrawalModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export default class AppModule {}
