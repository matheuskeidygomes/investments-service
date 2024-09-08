import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import AuthService from '../services/auth.service';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';

@ApiTags('auth')
@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
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
    status: 404,
    description: 'User not found',
  })
  async login(@Body() data: LoginDto) {
    try {
      return await this.authService.login(data);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async register(@Body() data: RegisterDto) {
    try {
      return await this.authService.register(data);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
