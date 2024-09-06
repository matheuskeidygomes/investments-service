/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserService from '../../user/services/user.service';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { User } from '@prisma/client';
import { compareSync, hashSync } from 'bcrypt';

@Injectable()
export default class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  generateToken(id: number): string {
    return this.jwtService.sign({ id });
  }

  async login(data: LoginDto) {
    const { email, password } = data;
    const userFound: User = await this.userService.getUserByEmailOrThrow(email);
    const passwordMatch: boolean = compareSync(password, userFound.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    delete userFound.password;

    const token = this.generateToken(userFound.id);

    return {
      token,
      user: userFound,
    };
  }

  async register(data: RegisterDto) {
    const { name, email, password } = data;
    const encryptedPassword: string = hashSync(password, 10);
    const user = await this.userService.createUser({
      name,
      email,
      password: encryptedPassword,
    } as User);
    const token = this.generateToken(user.id);

    return {
      token,
      user,
    };
  }
}
