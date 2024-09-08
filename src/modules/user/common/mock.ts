import { User } from '@prisma/client';

export const userData: User = {
  id: 1,
  name: 'John Doe',
  email: 'johndoe@email.com',
  password: 'password123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const usersData: User[] = [
  userData,
  {
    id: 2,
    name: 'Jane Doe',
    email: 'janedoe@email.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 3,
    name: 'Antun Perkovic',
    email: 'antunperkovic@email.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 4,
    name: 'Alicia Janneane',
    email: 'aliciajanneane@email.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 5,
    name: 'Hann Klein',
    email: 'hanklein@email.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 6,
    name: 'Aumirah Ulfa',
    email: 'aumirahulfa@email.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 7,
    name: 'James Klein',
    email: 'jamesklein@email.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  },
  {
    id: 8,
    name: 'Matthew',
    email: 'matthew@email.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 9,
    name: 'Dinnoco Oenid',
    email: 'dinnocooenid@email.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 10,
    name: 'Marshall Mathers',
    email: 'marshall@email.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  },
];

export const newUserData = {
  name: userData.name,
  email: userData.email,
  password: userData.password,
};

export const updateUserData = {
  email: 'new.email@example.com',
};
