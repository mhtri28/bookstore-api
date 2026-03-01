import { PrismaClient } from '../../src/generated/prisma/client';
import { CommonStatus } from '../../src/generated/prisma/enums';

export async function seedBooks(prisma: InstanceType<typeof PrismaClient>) {
  // Lấy category_id từ DB sau khi seed categories
  const categories = await prisma.category.findMany({
    select: { category_id: true, name: true },
  });

  const getCategoryId = (name: string) =>
    categories.find((c) => c.name === name)?.category_id ?? categories[0].category_id;

  await prisma.book.createMany({
    data: [
      {
        title: 'Đắc Nhân Tâm',
        price: 85000,
        stock: 100,
        image_url: null,
        status: CommonStatus.ACTIVE,
        category_id: getCategoryId('Kỹ năng sống'),
      },
      {
        title: 'Nhà Giả Kim',
        price: 75000,
        stock: 80,
        image_url: null,
        status: CommonStatus.ACTIVE,
        category_id: getCategoryId('Văn học'),
      },
      {
        title: 'Sapiens: Lược Sử Loài Người',
        price: 120000,
        stock: 60,
        image_url: null,
        status: CommonStatus.ACTIVE,
        category_id: getCategoryId('Lịch sử - Địa lý'),
      },
      {
        title: 'Atomic Habits',
        price: 95000,
        stock: 90,
        image_url: null,
        status: CommonStatus.ACTIVE,
        category_id: getCategoryId('Kỹ năng sống'),
      },
      {
        title: 'Tư Duy Nhanh Và Chậm',
        price: 110000,
        stock: 50,
        image_url: null,
        status: CommonStatus.ACTIVE,
        category_id: getCategoryId('Khoa học - Công nghệ'),
      },
    ],
    skipDuplicates: true,
  });

  console.log(' ✅ Seed books xong');
}
