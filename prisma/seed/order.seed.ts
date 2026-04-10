import { PrismaClient } from '../../src/generated/prisma/client';
import { CommonStatus, DiscountType, OrderStatus } from '../../src/generated/prisma/enums';

type SeedOrderItem = {
  title: string;
  quantity: number;
};

type SeedOrder = {
  userEmail: string;
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  status: OrderStatus;
  discountCode?: string;
  items: SeedOrderItem[];
};

export async function seedOrders(prisma: InstanceType<typeof PrismaClient>) {
  const users = await prisma.user.findMany({
    select: { user_id: true, email: true },
  });

  const getUserIdByEmail = (email: string) => users.find((user) => user.email === email)?.user_id;

  const seedData: SeedOrder[] = [
    {
      userEmail: 'customer@bookstore.com',
      receiver_name: 'Seed Customer A',
      receiver_phone: '0988111222',
      shipping_address: '12 Nguyen Hue, District 1, Ho Chi Minh City',
      status: OrderStatus.CONFIRMED,
      discountCode: 'BOOK10',
      items: [
        { title: 'Atomic Habits', quantity: 2 },
        { title: 'Nhà Giả Kim', quantity: 1 },
      ],
    },
    {
      userEmail: 'customer@bookstore.com',
      receiver_name: 'Seed Customer B',
      receiver_phone: '0988333444',
      shipping_address: '45 Vo Thi Sau, District 3, Ho Chi Minh City',
      status: OrderStatus.SHIPPING,
      items: [
        { title: 'Sapiens: Lược Sử Loài Người', quantity: 1 },
        { title: 'Đắc Nhân Tâm', quantity: 1 },
      ],
    },
    {
      userEmail: 'customer@bookstore.com',
      receiver_name: 'Seed Customer C',
      receiver_phone: '0988555666',
      shipping_address: '102 Nguyen Van Cu, District 5, Ho Chi Minh City',
      status: OrderStatus.COMPLETED,
      discountCode: 'FREESHIP30',
      items: [
        { title: 'Tư Duy Nhanh Và Chậm', quantity: 2 },
        { title: 'Nhà Giả Kim', quantity: 1 },
      ],
    },
  ];

  for (const orderSeed of seedData) {
    const userId = getUserIdByEmail(orderSeed.userEmail);

    if (!userId) {
      continue;
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        user_id: userId,
        receiver_name: orderSeed.receiver_name,
        receiver_phone: orderSeed.receiver_phone,
        shipping_address: orderSeed.shipping_address,
      },
      select: { order_id: true },
    });

    if (existingOrder) {
      continue;
    }

    await prisma.$transaction(async (tx) => {
      let subTotal = 0;
      const preparedItems: Array<{ book_id: number; quantity: number; price: number }> = [];

      for (const item of orderSeed.items) {
        const book = await tx.book.findFirst({
          where: { title: item.title },
          select: { book_id: true, price: true, stock: true, title: true },
        });

        if (!book) {
          throw new Error(`Khong tim thay sach: ${item.title}`);
        }

        if (book.stock < item.quantity) {
          throw new Error(`Sach ${book.title} khong du ton kho de tao order seed`);
        }

        const unitPrice = Number(book.price);
        subTotal += unitPrice * item.quantity;

        preparedItems.push({
          book_id: book.book_id,
          quantity: item.quantity,
          price: unitPrice,
        });
      }

      let discountAmount = 0;
      let discountId: number | undefined;

      if (orderSeed.discountCode) {
        const discount = await tx.discount.findUnique({
          where: { code: orderSeed.discountCode },
        });

        if (!discount) {
          throw new Error(`Khong tim thay ma giam gia: ${orderSeed.discountCode}`);
        }

        const now = new Date();
        if (discount.status !== CommonStatus.ACTIVE || now < discount.start_at || now > discount.expires_at) {
          throw new Error(`Ma giam gia khong hop le: ${discount.code}`);
        }

        if (discount.usage_limit !== null && discount.used_count >= discount.usage_limit) {
          throw new Error(`Ma giam gia da het luot dung: ${discount.code}`);
        }

        if (discount.min_order_value && subTotal < Number(discount.min_order_value)) {
          throw new Error(`Don hang khong du gia tri toi thieu cho ma: ${discount.code}`);
        }

        if (discount.discount_type === DiscountType.PERCENTAGE) {
          discountAmount = (subTotal * Number(discount.discount_value)) / 100;

          if (discount.max_discount_amount) {
            discountAmount = Math.min(discountAmount, Number(discount.max_discount_amount));
          }
        } else {
          discountAmount = Number(discount.discount_value);
        }

        discountAmount = Math.min(discountAmount, subTotal);
        discountId = discount.discount_id;
      }

      for (const item of preparedItems) {
        await tx.book.update({
          where: { book_id: item.book_id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (discountId) {
        await tx.discount.update({
          where: { discount_id: discountId },
          data: { used_count: { increment: 1 } },
        });
      }

      await tx.order.create({
        data: {
          user_id: userId,
          receiver_name: orderSeed.receiver_name,
          receiver_phone: orderSeed.receiver_phone,
          shipping_address: orderSeed.shipping_address,
          status: orderSeed.status,
          totalPrice: Math.max(subTotal - discountAmount, 0),
          discount_amount: discountAmount,
          discount_id: discountId,
          items: {
            create: preparedItems.map((item) => ({
              book_id: item.book_id,
              quantity: item.quantity,
              price: item.price,
              status: 'ACTIVE',
            })),
          },
        },
      });
    });
  }

  console.log(' ✅ Seed orders xong');
}
