import { Module } from '@nestjs/common';
import LoggerService from './services/logger.service';
import { Logger } from '@nestjs/common';

@Module({
  providers: [LoggerService, Logger],
  exports: [LoggerService],
})
export default class LoggerModule {}
