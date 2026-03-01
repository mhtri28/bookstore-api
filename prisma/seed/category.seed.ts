import { PrismaClient } from '../../src/generated/prisma/client';
import { CommonStatus } from '../../src/generated/prisma/enums';

export async function seedCategories(prisma: InstanceType<typeof PrismaClient>) {
  await prisma.category.createMany({
    data: [
      {
        name: 'Văn học',
        description: 'Các tác phẩm văn học trong và ngoài nước',
        status: CommonStatus.ACTIVE,
      },
      {
        name: 'Kinh tế',
        description: 'Sách về kinh tế, kinh doanh, tài chính',
        status: CommonStatus.ACTIVE,
      },
      {
        name: 'Kỹ năng sống',
        description: 'Sách phát triển bản thân và kỹ năng sống',
        status: CommonStatus.ACTIVE,
      },
      {
        name: 'Khoa học - Công nghệ',
        description: 'Sách về khoa học, công nghệ, lập trình',
        status: CommonStatus.ACTIVE,
      },
      {
        name: 'Lịch sử - Địa lý',
        description: 'Sách về lịch sử và địa lý trong và ngoài nước',
        status: CommonStatus.ACTIVE,
      },
      {
        name: 'Thiếu nhi',
        description: 'Sách dành cho trẻ em và thiếu nhi',
        status: CommonStatus.ACTIVE,
      },
    ],
    skipDuplicates: true,
  });

  console.log(' ✅ Seed categories xong');
}
