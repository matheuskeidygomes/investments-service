import {
  Controller,
  Body,
  UseGuards,
  Param,
  HttpStatus,
  HttpException,
  Get,
  Put,
  Req,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '../../auth/common/jwt.guard';
import UserService from '../services/user.service';
import { UpdateUserDto } from '../dtos/user.dto';
import { User } from '@prisma/client';
import LoggerService from '../../../logger/services/logger.service';

@ApiBearerAuth('JWT-auth')
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@Controller('user')
export default class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  async getUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<User[]> {
    const pageNumber = page || 1;
    const limitNumber = limit || 10;
    try {
      return await this.userService.getUsers(pageNumber, limitNumber);
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Get(':id')
  async getUser(@Param('id') id: number): Promise<User> {
    if (!id) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.userService.getUserByIdOrThrow(id);
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Put(':id')
  async updateUser(
    @Req() req: Request,
    @Body() data: UpdateUserDto,
    @Param('id') id: number,
  ): Promise<User> {
    const { user: userId } = req as any;

    if (!id) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    if (userId !== id) {
      throw new HttpException(
        'Cannot update other users',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      return await this.userService.updateUser(id, data as User);
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Put(':id/deactivate')
  async deactivateUser(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<User> {
    const { user: userId } = req as any;

    if (!id) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    if (userId !== id) {
      throw new HttpException(
        'Cannot deactivate other users',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      return await this.userService.deactivateUser(id);
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Put(':id/activate')
  async activateUser(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<User> {
    const { user: userId } = req as any;

    if (!id) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    if (userId !== id) {
      throw new HttpException(
        'Cannot activate other users',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      return await this.userService.activateUser(id);
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }
}
