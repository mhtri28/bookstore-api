import { PrismaClient } from '../../src/generated/prisma/client';
import { CommonStatus } from '../../src/generated/prisma/enums';

export async function seedSuppliers(prisma: PrismaClient) {
  await prisma.supplier.createMany({
    data: [
      {
        name: 'Nhà cung cấp A',
        email: 'supplierA@example.com',
        phone: '0123456789',
        address: 'Hà Nội',
        status: CommonStatus.ACTIVE,
      },
      {
        name: 'Nhà cung cấp B',
        email: 'supplierB@example.com',
        phone: '0987654321',
        address: 'Hồ Chí Minh',
        status: CommonStatus.ACTIVE,
      },
    ],
    skipDuplicates: true,
  });

  console.log(' ✅ Seed suppliers xong');
}
