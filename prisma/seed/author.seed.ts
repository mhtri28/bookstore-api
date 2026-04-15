import { PrismaClient } from '../../src/generated/prisma/client';
import { CommonStatus } from '../../src/generated/prisma/enums';

export async function seedAuthors(prisma: InstanceType<typeof PrismaClient>) {
  const seedData = [
    { name: 'Dale Carnegie', status: CommonStatus.ACTIVE },
    { name: 'Paulo Coelho', status: CommonStatus.ACTIVE },
    { name: 'Yuval Noah Harari', status: CommonStatus.ACTIVE },
    { name: 'James Clear', status: CommonStatus.ACTIVE },
    { name: 'Daniel Kahneman', status: CommonStatus.ACTIVE },
  ];

  const existingAuthors = await prisma.author.findMany({
    select: { name: true },
  });

  const existingNames = new Set(existingAuthors.map((author) => author.name.toLowerCase()));

  const dataToCreate = seedData.filter((author) => !existingNames.has(author.name.toLowerCase()));

  if (dataToCreate.length > 0) {
    await prisma.author.createMany({
      data: dataToCreate,
    });
  }

  console.log(' ✅ Seed authors xong');
}
