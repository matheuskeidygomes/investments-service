import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus } from '@nestjs/common';
import UserService from '../../user/services/user.service';
import PrismaService from '../../../prisma/services/prisma.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { useContainer, validate } from 'class-validator';
import { IsEmailUniqueConstraint } from '../../user/constraints/isEmailUnique';
import { userData, newUserData } from '../../user/common/mock';
import AuthService from './auth.service';
import { hashSync } from 'bcrypt';

describe('AuthService', () => {
  let userService: UserService;
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const generateToken = () => {
    return Math.random().toString(36).substring(7);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        AuthService,
        UserService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: Cache,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        IsEmailUniqueConstraint,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    useContainer(module, { fallbackOnErrors: true });
  });

  it('services should be defined', () => {
    expect(userService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(authService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('login', () => {
    it('it should login user', async () => {
      const hashPassword = hashSync(userData.password, 10);

      jest.spyOn(jwtService, 'sign').mockReturnValue(generateToken());
      jest.spyOn(userService, 'getUserByEmailOrThrow').mockResolvedValue({
        ...userData,
        password: hashPassword,
      } as User);

      const login = await authService.login({
        email: userData.email,
        password: userData.password,
      } as LoginDto);

      expect(login).toHaveProperty('token');
    });

    it('it should throw error when credentials are invalid', async () => {
      jest.spyOn(userService, 'getUserByEmailOrThrow').mockResolvedValue({
        ...userData,
        password: hashSync(userData.password, 10),
      } as User);

      const login = async () =>
        await authService.login({
          email: userData.email,
          password: 'invalid-password',
        } as LoginDto);

      expect(login).rejects.toThrowError(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });

    it('it should throw error when user is not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      const login = async () =>
        await authService.login({
          email: userData.email,
          password: userData.password,
        } as LoginDto);

      expect(login).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('it should throw error when email field is empty', async () => {
      const login = new LoginDto({ email: '', password: userData.password });
      const errors = await validate(login);

      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints.isNotEmpty).toBe('Email must not be empty');
    });

    it('it should throw error when email is not valid', async () => {
      const login = new LoginDto({
        email: 'invalid-email',
        password: userData.password,
      });
      const errors = await validate(login);

      expect(errors[0].constraints).toHaveProperty('isEmail');
      expect(errors[0].constraints.isEmail).toBe('Email must be a valid email');
    });

    it('it should throw error when password field is empty', async () => {
      const login = new LoginDto({ email: userData.email, password: '' });
      const errors = await validate(login);

      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints.isNotEmpty).toBe(
        'Password must not be empty',
      );
    });
  });

  describe('register', () => {
    it('it should register user', async () => {
      const hashPassword = hashSync(newUserData.password, 10);

      jest.spyOn(jwtService, 'sign').mockReturnValue(generateToken());
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        ...userData,
        password: hashPassword,
      } as User);

      const register = await authService.register(newUserData as RegisterDto);

      expect(register).toHaveProperty('token');
    });

    it('it should throw error when email already exist', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userData);
      const register = new RegisterDto(newUserData);
      const errors = await validate(register);

      expect(errors[0].constraints).toHaveProperty('isEmailUnique');
      expect(errors[0].constraints.isEmailUnique).toBe('Email already exists');
    });

    it('it should throw error when email field is empty', async () => {
      const register = new RegisterDto({
        ...newUserData,
        email: '',
      });
      const errors = await validate(register);

      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints.isNotEmpty).toBe('Email must not be empty');
    });

    it('it should throw error when email is not valid', async () => {
      const register = new RegisterDto({
        ...newUserData,
        email: 'invalid-email',
      });
      const errors = await validate(register);

      expect(errors[0].constraints).toHaveProperty('isEmail');
      expect(errors[0].constraints.isEmail).toBe('Email must be a valid email');
    });

    it('it should throw error when password field is empty', async () => {
      const register = new RegisterDto({
        ...newUserData,
        password: '',
      });
      const errors = await validate(register);

      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints.isNotEmpty).toBe(
        'Password must not be empty',
      );
    });

    it('it should throw error when password have spaces', async () => {
      const register = new RegisterDto({
        ...newUserData,
        password: '123 456',
      });
      const errors = await validate(register);

      expect(errors[0].constraints).toHaveProperty('NoSpaces');
      expect(errors[0].constraints.NoSpaces).toBe(
        'Password should not contain spaces',
      );
    });

    it('it should throw error when name field is empty', async () => {
      const register = new RegisterDto({
        ...newUserData,
        name: '',
      });
      const errors = await validate(register);

      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints.isNotEmpty).toBe('Name must not be empty');
    });
  });
});
