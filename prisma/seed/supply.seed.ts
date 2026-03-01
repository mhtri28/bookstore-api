import { PrismaClient } from '../../src/generated/prisma/client';

export async function seedSupplies(prisma: InstanceType<typeof PrismaClient>) {
  const suppliers = await prisma.supplier.findMany();
  const books = await prisma.book.findMany();

  const getSupplierID = (name: string) =>
    suppliers.find((s) => s.name === name)?.supplier_id ?? suppliers[0].supplier_id;

  const getBookId = (title: string) => books.find((b) => b.title === title)?.book_id ?? books[0].book_id;

  const suppliesData = [
    {
      supplier_id: getSupplierID('Nhà cung cấp A'),
      imported_at: new Date('2026-01-10'),
      details: [
        { title: 'Đắc Nhân Tâm', quantity: 50, imported_price: 60000 },
        { title: 'Nhà Giả Kim', quantity: 40, imported_price: 50000 },
      ],
    },
    {
      supplier_id: getSupplierID('Nhà cung cấp B'),
      imported_at: new Date('2026-02-05'),
      details: [
        { title: 'Sapiens: Lược Sử Loài Người', quantity: 30, imported_price: 90000 },
        { title: 'Atomic Habits', quantity: 45, imported_price: 70000 },
        { title: 'Tư Duy Nhanh Và Chậm', quantity: 25, imported_price: 80000 },
      ],
    },
  ];

  for (const supply of suppliesData) {
    const { details, ...supplyData } = supply;

    const total_amount = details.reduce((sum, d) => sum + d.quantity * d.imported_price, 0);

    const createdSupply = await prisma.supply.create({
      data: {
        ...supplyData,
        total_amount,
      },
    });

    await prisma.supplyDetail.createMany({
      data: details.map((d) => ({
        supply_id: createdSupply.supply_id,
        book_id: getBookId(d.title),
        quantity: d.quantity,
        imported_price: d.imported_price,
      })),
    });
  }

  console.log(' ✅ Seed supplies xong');
}
