import { PrismaClient } from '../../src/generated/prisma/client';

export async function seedBookAuthors(prisma: InstanceType<typeof PrismaClient>) {
  const books = await prisma.book.findMany({
    select: { book_id: true, title: true },
  });

  const authors = await prisma.author.findMany({
    select: { author_id: true, name: true },
  });

  const getBookId = (title: string) => books.find((book) => book.title === title)?.book_id;
  const getAuthorId = (name: string) => authors.find((author) => author.name === name)?.author_id;

  const relations = [
    { title: 'Đắc Nhân Tâm', authorName: 'Dale Carnegie' },
    { title: 'Nhà Giả Kim', authorName: 'Paulo Coelho' },
    { title: 'Sapiens: Lược Sử Loài Người', authorName: 'Yuval Noah Harari' },
    { title: 'Atomic Habits', authorName: 'James Clear' },
    { title: 'Tư Duy Nhanh Và Chậm', authorName: 'Daniel Kahneman' },
  ];

  const dataToCreate = relations
    .map((relation) => ({
      book_id: getBookId(relation.title),
      author_id: getAuthorId(relation.authorName),
    }))
    .filter(
      (item): item is { book_id: number; author_id: number } =>
        typeof item.book_id === 'number' && typeof item.author_id === 'number',
    );

  if (dataToCreate.length > 0) {
    await prisma.bookAuthor.createMany({
      data: dataToCreate,
      skipDuplicates: true,
    });
  }

  console.log(' ✅ Seed book authors xong');
}
