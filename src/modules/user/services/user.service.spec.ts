import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import UserService from './user.service';
import PrismaService from '../../../prisma/services/prisma.service'; // Ajuste o caminho conforme necessário
import { Cache } from '@nestjs/cache-manager';
import { CacheModule } from '@nestjs/cache-manager';
import { User } from '@prisma/client';
import { RegisterDto } from '../../auth/dtos/auth.dto';
import { UpdateUserDto } from '../dtos/user.dto';
import { validate } from 'class-validator';
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
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
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

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
      });
      expect(result).toEqual([
        { ...deepClone(usersData[0]), password: undefined },
        { ...deepClone(usersData[1]), password: undefined },
      ]);
    });
  });

  describe('getUser', () => {
    it('should return user and removing secret fields', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(deepClone(userData));

      const result = await userService.getUserByIdOrThrow(1);

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
      });
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
    it('should throw an HttpException if the user already exists', async () => {
      jest
        .spyOn(userService, 'getUserByEmail')
        .mockResolvedValue(deepClone(userData));

      const user = async () =>
        await userService.createUser(deepClone(userData));

      expect(user).rejects.toThrowError(
        new HttpException('User already exists', HttpStatus.CONFLICT),
      );
    });

    it('should create a user if not already exists', async () => {
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);

      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(deepClone(userData));

      const result = await userService.createUser(deepClone(newUserData));

      expect(result).toEqual({ ...deepClone(userData), password: undefined });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: newUserData,
      });
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

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserData,
      });
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
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      jest
        .spyOn(userService, 'getUserByIdOrThrow')
        .mockResolvedValue(deepClone(userData));

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...deepClone(userData),
        deletedAt: new Date(),
      });

      const result = await userService.deactivateUser(1);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual({
        ...deepClone(userData),
        deletedAt: expect.any(Date),
        password: undefined,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(null);

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

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: null },
      });
      expect(result).toEqual({
        ...deepClone(userData),
        deletedAt: null,
        password: undefined,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(null);

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

  describe('validating user data when creating', () => {
    it('should return an error if email is not valid', async () => {
      const user = new RegisterDto({
        ...deepClone(newUserData),
        email: 'teste',
      });
      const errors = await validate(user);

      expect(errors.length).toBe(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('validating user data when updating', () => {
    it('should return an error if email is not valid', async () => {
      const user = new UpdateUserDto({
        ...deepClone(updateUserData),
        email: 'teste',
      });
      const errors = await validate(user);

      expect(errors.length).toBe(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should return an error if name is not a string', async () => {
      const user = new UpdateUserDto({
        ...deepClone(updateUserData),
        name: 123,
      });
      const errors = await validate(user);

      expect(errors.length).toBe(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should return an error if password is not a string', async () => {
      const user = new UpdateUserDto({
        ...deepClone(updateUserData),
        password: 123,
      });
      const errors = await validate(user);

      expect(errors.length).toBe(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should return an error if any field is empty', async () => {
      const user = new UpdateUserDto({
        ...deepClone(updateUserData),
        email: '',
      });
      const errors = await validate(user);

      expect(errors.length).toBe(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
