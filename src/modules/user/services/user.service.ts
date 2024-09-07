import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import PrismaService from '../../../prisma/services/prisma.service';
import { User } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export default class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async getUsers(page: number, limit: number): Promise<User[]> {
    const cacheKey = `users:page:${page}limit:${limit}`;
    const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);
    if (cachedUsers) return cachedUsers;

    let users: User[] = await this.prisma.user.findMany({
      take: limit,
      skip: (page - 1) * limit,
    });

    users = users.map((user) => {
      delete user.password;
      return user;
    });

    await this.cacheManager.set(cacheKey, users);

    return users;
  }

  async getUserByIdOrThrow(id: number): Promise<User> {
    const cacheKey = `user:id:${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser) return cachedUser;

    const user: User = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    delete user.password;

    await this.cacheManager.set(cacheKey, user);

    return user;
  }

  async verifyUserIsActivatedOrThrow(id: number): Promise<User> {
    const user: User = await this.getUserByIdOrThrow(id);

    if (user.deletedAt) {
      throw new HttpException('User is deactivated', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user: User = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    return user;
  }

  async getUserByEmailOrThrow(email: string): Promise<User> {
    const user: User = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async createUser(data: User): Promise<User> {
    const { name, email, password } = data;
    const foundUser: User = await this.getUserByEmail(email);

    if (foundUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const user: User = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });
    delete user.password;
    return user;
  }

  async updateUser(id: number, data: User): Promise<User> {
    const foundUser = await this.getUserByIdOrThrow(id);

    if (foundUser.deletedAt) {
      throw new HttpException(
        'User is deactivated',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user: User = await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
    delete user.password;
    return user;
  }

  async deactivateUser(id: number): Promise<User> {
    const foundUser = await this.getUserByIdOrThrow(id);

    if (foundUser.deletedAt) {
      throw new HttpException(
        'User is already deactivated',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user: User = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    delete user.password;
    return user;
  }

  async activateUser(id: number): Promise<User> {
    const foundUser = await this.getUserByIdOrThrow(id);

    if (!foundUser.deletedAt) {
      throw new HttpException(
        'User is already activated',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user: User = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: null,
      },
    });
    delete user.password;
    return user;
  }
}
