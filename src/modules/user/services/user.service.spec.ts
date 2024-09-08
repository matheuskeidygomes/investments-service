import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import UserService from './user.service';
import PrismaService from '../../../prisma/services/prisma.service';
import { Cache } from '@nestjs/cache-manager';
import { CacheModule } from '@nestjs/cache-manager';
import { User } from '@prisma/client';
import { UpdateUserDto } from '../dtos/user.dto';
import { useContainer, validate } from 'class-validator';
import { IsEmailUniqueConstraint } from '../constraints/isEmailUnique';
import {
  userData,
  usersData,
  newUserData,
  updateUserData,
} from '../common/mock';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  const deepClone = (obj: unknown) => {
    return JSON.parse(JSON.stringify(obj));
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
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

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return all users and removing secret fields', async () => {
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(deepClone(usersData));

      const result = await userService.getUsers(1, 10);

      expect(result.length).toBe(10);
      expect(result[0]).toEqual({
        ...deepClone(userData),
        password: undefined,
      });
    });
  });

  describe('getUser', () => {
    it('should return user and removing secret fields', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(deepClone(userData));

      const result = await userService.getUserByIdOrThrow(1);

      expect(result).toEqual({ ...deepClone(userData), password: undefined });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      const user = async () => await userService.getUserByIdOrThrow(1);

      expect(user).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);

      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(deepClone(userData));

      const result = await userService.createUser(deepClone(newUserData));

      expect(result).toEqual({ ...deepClone(userData), password: undefined });
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      jest
        .spyOn(userService, 'getUserByIdOrThrow')
        .mockResolvedValue(deepClone(userData));

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...deepClone(userData),
        email: updateUserData.email,
      });

      const result = await userService.updateUser(1, updateUserData as User);

      expect(result).toEqual({
        ...deepClone(userData),
        email: updateUserData.email,
        password: undefined,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(null);

      const user = async () =>
        await userService.updateUser(1, updateUserData as User);

      expect(user).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw UnprocessableEntityException if user is deactivated', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue({ ...deepClone(userData), deletedAt: new Date() });

      const user = async () =>
        await userService.updateUser(1, updateUserData as User);

      expect(user).rejects.toThrowError(
        new HttpException(
          'User is deactivated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });

    it('should return an error if email already exists', async () => {
      jest
        .spyOn(userService, 'getUserByEmail')
        .mockResolvedValue(deepClone(userData));

      const user = new UpdateUserDto({
        email: userData.email,
      });
      const errors = await validate(user);

      expect(errors[0].constraints).toHaveProperty('isEmailUnique');
      expect(errors[0].constraints.isEmailUnique).toBe('Email already exists');
    });

    it('should return an error if email is not valid', async () => {
      const user = new UpdateUserDto({
        email: 'teste',
      });
      const errors = await validate(user);

      expect(errors[0].constraints).toHaveProperty('isEmail');
      expect(errors[0].constraints.isEmail).toBe('Email must be a valid email');
    });

    it('should return an error if password have spaces', async () => {
      const user = new UpdateUserDto({
        password: '123 456',
      });
      const errors = await validate(user);

      expect(errors[0].constraints).toHaveProperty('NoSpaces');
      expect(errors[0].constraints.NoSpaces).toBe(
        'Password should not contain spaces',
      );
    });

    it('should return an error if email field is empty', async () => {
      const user = new UpdateUserDto({
        email: '',
      });
      const errors = await validate(user);

      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints.isNotEmpty).toBe('Email must not be empty');
    });

    it('should return an error if password field is empty', async () => {
      const user = new UpdateUserDto({
        password: '',
      });
      const errors = await validate(user);

      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints.isNotEmpty).toBe(
        'Password must not be empty',
      );
    });

    it('should return an error if name field is empty', async () => {
      const user = new UpdateUserDto({
        name: '',
      });
      const errors = await validate(user);

      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints.isNotEmpty).toBe('Name must not be empty');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      const deletedAt = new Date();

      jest
        .spyOn(userService, 'getUserByIdOrThrow')
        .mockResolvedValue(deepClone(userData));

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...deepClone(userData),
        deletedAt,
      });

      const result = await userService.deactivateUser(1);

      expect(result).toEqual({
        ...deepClone(userData),
        deletedAt,
        password: undefined,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      const user = async () => await userService.deactivateUser(1);

      expect(user).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw UnprocessableEntityException if user is already deactivated', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue({ ...deepClone(userData), deletedAt: new Date() });

      const user = async () => await userService.deactivateUser(1);

      expect(user).rejects.toThrowError(
        new HttpException(
          'User is already deactivated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });

  describe('activateUser', () => {
    it('should activate user', async () => {
      jest
        .spyOn(userService, 'getUserByIdOrThrow')
        .mockResolvedValue({ ...deepClone(userData), deletedAt: new Date() });

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...deepClone(userData),
        deletedAt: null,
      });

      const result = await userService.activateUser(1);

      expect(result).toEqual({
        ...deepClone(userData),
        deletedAt: null,
        password: undefined,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      const user = async () => await userService.activateUser(1);

      expect(user).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw UnprocessableEntityException if user is already activated', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue({ ...deepClone(userData), deletedAt: null });

      const user = async () => await userService.activateUser(1);

      expect(user).rejects.toThrowError(
        new HttpException(
          'User is already activated',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });
});
