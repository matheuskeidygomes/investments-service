import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import AuthService from '../services/auth.service';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';

@ApiTags('auth')
@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() data: LoginDto) {
    try {
      return await this.authService.login(data);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('register')
  async register(@Body() data: RegisterDto) {
    try {
      return await this.authService.register(data);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
