import { Module } from '@nestjs/common';
import PrismaModule from '../../prisma/prisma.module';
import UsersService from './services/user.service';
import UsersController from './controllers/user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export default class UsersModule {}
