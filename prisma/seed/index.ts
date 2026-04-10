import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../src/generated/prisma/client';
import { seedCategories } from './category.seed';
import { seedSuppliers } from './supplier.seed';
import { seedBooks } from './book.seed';
import { seedSupplies } from './supply.seed';
import { seedUsers } from './user.seed';
import { seedAuthors } from './author.seed';
import { seedBookAuthors } from './book-author.seed';
import { seedAddresses } from './address.seed';
import { seedDiscounts } from './discount.seed';
import { seedOrders } from './order.seed';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

const prisma = new (PrismaClient as any)({ adapter });

async function main() {
  console.log('🌱 Bắt đầu seed...');

  await seedCategories(prisma);
  await seedSuppliers(prisma);
  await seedUsers(prisma);
  await seedBooks(prisma);
  await seedAuthors(prisma);
  await seedBookAuthors(prisma);
  await seedAddresses(prisma);
  await seedDiscounts(prisma);
  await seedSupplies(prisma);
  await seedOrders(prisma);

  console.log('✅ Seed hoàn thành!');
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
