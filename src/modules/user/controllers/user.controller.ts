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
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get users' })
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
  @ApiResponse({
    status: 200,
    description: 'List of users',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'User id',
  })
  @ApiResponse({
    status: 200,
    description: 'Return a user',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user id',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUser(@Param('id') id: number): Promise<User> {
    if (!id) {
      throw new HttpException('User id is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.userService.getUserByIdOrThrow(id);
    } catch (error) {
      this.logger.error(`${error.status} - ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'User id (must be the same as the authenticated user)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return updated user',
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
    status: 403,
    description: 'Cannot update other users',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 422,
    description: 'User deactivated',
  })
  async updateUser(
    @Req() req: Request,
    @Body() data: UpdateUserDto,
    @Param('id') id: number,
  ): Promise<User> {
    const { user: userId } = req;

    if (!id) {
      throw new HttpException('User id is required', HttpStatus.BAD_REQUEST);
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
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'User id (must be the same as the authenticated user)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return deactivated user',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user id',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot deactivate other users',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 422,
    description: 'User already deactivated',
  })
  async deactivateUser(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<User> {
    const { user: userId } = req;

    if (!id) {
      throw new HttpException('User id is required', HttpStatus.BAD_REQUEST);
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
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'User id (must be the same as the authenticated user)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return activated user',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user id',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot activate other users',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 422,
    description: 'User already activated',
  })
  async activateUser(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<User> {
    const { user: userId } = req;

    if (!id) {
      throw new HttpException('User id is required', HttpStatus.BAD_REQUEST);
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
