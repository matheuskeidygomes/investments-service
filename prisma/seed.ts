/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import calculateInvestment from '../src/helpers/calculate';
import { hashSync } from 'bcrypt';

const usersNumber = 1000;
const investmentsNumber = 100;

const randomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

const prisma = new PrismaClient();

async function createUsers() {
  const users = [];
  const uniqueEmails = [];

  console.log('--- Creating users...');

  const passwordHashed = hashSync('1111', 10);

  for (let i = 0; i < usersNumber; i++) {
    let email = faker.internet.email();

    while (uniqueEmails.includes(email)) {
      email = faker.internet.email();
    }

    uniqueEmails.push(email);

    users.push({
      email: `admin${i}@example.com`,
      name: `Admin ${i}`,
      password: passwordHashed,
    });
  }

  await prisma.user.createMany({
    data: users,
  });

  console.log('--- Users created successfully!');
  console.log('--- Users created: ' + users.length);
}

async function createInvestments() {
  const users = await prisma.user.findMany();
  const investments = [];

  console.log('--- Creating investments...');

  users.forEach((user, index) => {
    for (let i = 0; i < investmentsNumber; i++) {
      const createdAt = randomDate(new Date(2020, 0, 1), new Date());
      const deletedAt = index % 2 === 0 ? randomDate(createdAt, new Date()) : null;

      investments.push({
        amount: Number(faker.finance.amount()),
        userId: user.id,
        createdAt,
        deletedAt,
        updatedAt: deletedAt ?? createdAt,
      });
    }
  });

  await prisma.investment.createMany({
    data: investments,
  });

  console.log('--- Investments created successfully!');
  console.log('--- Investments created: ' + investments.length);
}

async function createWithdrawals() {
  const investments = await prisma.investment.findMany();
  const withdrawals = [];

  console.log('--- Creating withdrawals...');

  investments.forEach((investment) => {
    if (!investment.deletedAt) return;

    withdrawals.push({
      amount: calculateInvestment(investment),
      investmentId: investment.id,
      userId: investment.userId,
    });
  });

  await prisma.withdrawal.createMany({
    data: withdrawals,
  });

  console.log('--- Withdrawals created successfully!');
  console.log('--- Withdrawals created: ' + withdrawals.length);
}

async function isDatabaseSeeded() {
  const users = await prisma.user.findMany();
  const investments = await prisma.investment.findMany();
  const withdrawals = await prisma.withdrawal.findMany();

  if (users.length > 0 && investments.length > 0 && withdrawals.length > 0) {
    console.log('------- Database already seeded!');
    return true;
  }

  return false;
}

async function main() {
  const databaseSeeded = await isDatabaseSeeded();
  if (databaseSeeded) {
    await prisma.$disconnect();
    return;
  }

  try {
    console.log('------- Initializing seed...');
    await createUsers();
    await createInvestments();
    await createWithdrawals();
  } catch (error) {
    console.error('------- Error on seed: ' + error.message);
  } finally {
    console.log('------- Seed finished successfully!');
    await prisma.$disconnect();
  }
}

main();
