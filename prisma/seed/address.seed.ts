import { PrismaClient } from '../../src/generated/prisma/client';

type AddressSeedData = {
  userEmail: string;
  name: string;
  phone: string;
  shipping_address: string;
  isDefault: boolean;
};

export async function seedAddresses(prisma: InstanceType<typeof PrismaClient>) {
  const users = await prisma.user.findMany({
    select: { user_id: true, email: true },
  });

  const getUserIdByEmail = (email: string) => users.find((user) => user.email === email)?.user_id;

  const seedData: AddressSeedData[] = [
    {
      userEmail: 'admin@bookstore.com',
      name: 'Admin Office',
      phone: '0901000001',
      shipping_address: '123 Tran Hung Dao, Hoan Kiem, Ha Noi',
      isDefault: true,
    },
    {
      userEmail: 'admin@bookstore.com',
      name: 'Admin Warehouse',
      phone: '0901000002',
      shipping_address: '88 Le Van Luong, Thanh Xuan, Ha Noi',
      isDefault: false,
    },
    {
      userEmail: 'customer@bookstore.com',
      name: 'Tran Thi User',
      phone: '0912000001',
      shipping_address: '12 Nguyen Hue, District 1, Ho Chi Minh City',
      isDefault: true,
    },
    {
      userEmail: 'customer@bookstore.com',
      name: 'Tran Thi User - Home',
      phone: '0912000002',
      shipping_address: '45 Vo Thi Sau, District 3, Ho Chi Minh City',
      isDefault: false,
    },
  ];

  for (const addressData of seedData) {
    const userId = getUserIdByEmail(addressData.userEmail);

    if (!userId) {
      continue;
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        user_id: userId,
        phone: addressData.phone,
        shipping_address: addressData.shipping_address,
      },
    });

    if (!existingAddress) {
      await prisma.address.create({
        data: {
          user_id: userId,
          name: addressData.name,
          phone: addressData.phone,
          shipping_address: addressData.shipping_address,
          isDefault: addressData.isDefault,
        },
      });
    }
  }

  console.log(' ✅ Seed addresses xong');
}
