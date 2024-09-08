import { User } from '@prisma/client';

export const userData: User = {
  id: 1,
  name: 'John Doe',
  email: 'johndoe@example.com',
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
    email: 'janedoe@example.com',
    ...userData,
  },
  {
    id: 3,
    name: 'Antun Perkovic',
    email: 'antunperkovic@example.com',
    ...userData,
  },
  {
    id: 4,
    name: 'Alicia Janneane',
    email: 'aliciajanneane@example.com',
    ...userData,
  },
  {
    id: 5,
    name: 'Hann Klein',
    email: 'hanklein@example.com',
    ...userData,
  },
  {
    id: 6,
    name: 'Aumirah Ulfa',
    email: 'aumirahulfa@example.com',
    password: 'password123',
    ...userData,
  },
  {
    id: 7,
    name: 'James Klein',
    email: 'jamesklein@example.com',
    deletedAt: new Date(),
    ...userData,
  },
  {
    id: 8,
    name: 'Matthew',
    email: 'matthew@example.com',
    ...userData,
  },
  {
    id: 9,
    name: 'Dinnoco Oenid',
    email: 'dinnocooenid@example.com',
    ...userData,
  },
  {
    id: 10,
    name: 'Marshall Mathers',
    email: 'marshall@example.com',
    deletedAt: new Date(),
    ...userData,
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
