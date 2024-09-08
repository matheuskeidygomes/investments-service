import { Module } from '@nestjs/common';
import PrismaModule from '../../prisma/prisma.module';
import UsersService from './services/user.service';
import UsersController from './controllers/user.controller';
import { IsEmailUniqueConstraint } from './constraints/isEmailUnique';
import LoggerModule from '../../logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [UsersController],
  providers: [UsersService, IsEmailUniqueConstraint],
  exports: [UsersService],
})
export default class UsersModule {}
