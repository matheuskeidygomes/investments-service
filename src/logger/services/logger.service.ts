import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export default class LoggerService {
  constructor(private logger: Logger) {}

  log(message: string, context = '') {
    this.logger.log(message, context);
  }

  error(message: string, trace = '', context = '') {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context = '') {
    this.logger.warn(message, context);
  }
}
