/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import calculateInvestment from '../src/helpers/calculate';
import randomDate from '../src/helpers/time';

const usersNumber = 1000;           
const investmentsNumber = 100;      

const prisma = new PrismaClient();

async function createUsers() {
  const users = [];
  const uniqueEmails = [];
  
  console.log('--- Creating users...');

  for (let i = 0; i < usersNumber; i++) {
    let email = faker.internet.email();

    while (uniqueEmails.includes(email)) {
      email = faker.internet.email();
    }

    uniqueEmails.push(email);

    users.push({
      email,
      name: faker.person.fullName(),
      password: faker.internet.password(),
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

  users.forEach((user) => {
    for (let i = 0; i < investmentsNumber; i++) {
      investments.push({
        amount: Number(faker.finance.amount()),
        userId: user.id,
        createdAt: randomDate(new Date(2020, 0, 1), new Date()),
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

  investments.forEach((investment, index) => {
    if (index % 2 === 0) return;
  
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

async function main() {
  console.log('------- Initiating seeding...');
  try {
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
