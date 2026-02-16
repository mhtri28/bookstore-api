import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma } from '../../generated/prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { items, discount_code, ...orderData } = createOrderDto;

    if (!items || items.length === 0) {
      throw new HttpException(
        'Cần ít nhất một sản phẩm trong đơn hàng',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const bookIds = items.map((item) => item.book_id);

      const books = await tx.book.findMany({
        where: { book_id: { in: bookIds } },
      });

      if (books.length !== new Set(bookIds).size) {
        throw new HttpException(
          'Một hoặc nhiều sách không tồn tại trong hệ thống',
          HttpStatus.NOT_FOUND,
        );
      }

      for (const item of items) {
        const book = books.find((b) => b.book_id === item.book_id)!;

        if (book.stock < item.quantity) {
          throw new HttpException(
            `Sách "${book.title}" không đủ hàng. Tồn kho: ${book.stock}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        await tx.book.update({
          where: { book_id: book.book_id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const subTotal = items.reduce((total, item) => {
        const book = books.find((b) => b.book_id === item.book_id)!;
        return total + Number(book.price) * item.quantity;
      }, 0);

      let discountAmount = 0;
      let discountId: number | null = null;

      if (discount_code) {
        const discount = await tx.discount.findUnique({
          where: { code: discount_code },
        });

        if (!discount) {
          throw new HttpException(
            'Mã giảm giá không tồn tại',
            HttpStatus.NOT_FOUND,
          );
        }

        const now = new Date();

        if (discount.status !== 'ACTIVE') {
          throw new HttpException(
            'Mã giảm giá không còn hiệu lực',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (now < discount.start_at || now > discount.expires_at) {
          throw new HttpException(
            'Mã giảm giá chưa đến hạn hoặc đã hết hạn',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (
          discount.usage_limit !== null &&
          discount.used_count >= discount.usage_limit
        ) {
          throw new HttpException(
            'Mã giảm giá đã hết lượt sử dụng',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (
          discount.min_order_value &&
          subTotal < Number(discount.min_order_value)
        ) {
          throw new HttpException(
            `Đơn hàng tối thiểu ${Number(discount.min_order_value)} mới được áp dụng mã`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (discount.discount_type === 'PERCENTAGE') {
          discountAmount =
            (subTotal * Number(discount.discount_value)) / 100;

          if (discount.max_discount_amount) {
            discountAmount = Math.min(
              discountAmount,
              Number(discount.max_discount_amount),
            );
          }
        } else {
          discountAmount = Number(discount.discount_value);
        }

        if (discountAmount > subTotal) {
          discountAmount = subTotal;
        }

        await tx.discount.update({
          where: { discount_id: discount.discount_id },
          data: { used_count: { increment: 1 } },
        });

        discountId = discount.discount_id;
      }

      const finalPrice = Math.max(subTotal - discountAmount, 0);

      return tx.order.create({
        data: {
          ...orderData,
          totalPrice: new Prisma.Decimal(finalPrice),
          discount_amount: new Prisma.Decimal(discountAmount),
          user: { connect: { user_id: userId } },
          ...(discountId && {
            discount: { connect: { discount_id: discountId } },
          }),
          items: {
            create: items.map((item) => {
              const book = books.find((b) => b.book_id === item.book_id)!;
              return {
                book: { connect: { book_id: item.book_id } },
                quantity: item.quantity,
                price: book.price,
              };
            }),
          },
        },
        include: {
          items: {
            include: { book: true },
          },
          discount: true,
        },
      });
    });
  }
  
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { book: true } },
        discount: true,
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: id },
      include: {
        items: { include: { book: true } },
        discount: true,
      },
    });

    if (!order) {
      throw new HttpException(
        'Không tìm thấy đơn hàng',
        HttpStatus.NOT_FOUND,
      );
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { order_id: id },
        include: { items: true, discount: true },
      });

      if (!order) {
        throw new HttpException('Đơn hàng không tồn tại', HttpStatus.NOT_FOUND);
      }

      if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
        throw new HttpException(
          'Đơn hàng đã ở trạng thái cuối cùng',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (status === 'CANCELLED') {
        for (const item of order.items) {
          await tx.book.update({
            where: { book_id: item.book_id },
            data: { stock: { increment: item.quantity } },
          });
        }

        if (order.discount) {
          await tx.discount.update({
            where: { discount_id: order.discount.discount_id },
            data: { used_count: { decrement: 1 } },
          });
        }
      }

      return tx.order.update({
        where: { order_id: id },
        data: { status },
        include: {
          items: { include: { book: true } },
          discount: true,
        },
      });
    });
  }
}
