import { PrismaClient } from '../../src/generated/prisma/client';
import { Role, UserStatus } from '../../src/generated/prisma/enums';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '123456';

export async function seedUsers(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  await prisma.user.createMany({
    data: [
      {
        fullname: 'Admin System',
        email: 'admin@bookstore.com',
        password: hashedPassword,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
      {
        fullname: 'Trần Thị User',
        email: 'customer@bookstore.com',
        password: hashedPassword,
        role: Role.USER,
        status: UserStatus.ACTIVE,
      },
    ],
    skipDuplicates: true,
  });

  console.log(' ✅ Seed users xong');
  console.log('   📋 Tài khoản mặc định:');
  console.log('     - admin@bookstore.com    | 123456 | ADMIN');
  console.log('     - customer@bookstore.com | 123456 | USER');
}
