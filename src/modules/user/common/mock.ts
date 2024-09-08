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
];

export const newUserData = {
  name: userData.name,
  email: userData.email,
  password: userData.password,
};

export const updateUserData = {
  email: 'new.email@example.com',
};
