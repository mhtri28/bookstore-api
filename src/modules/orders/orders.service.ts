import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma } from '../../generated/prisma/client';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapOrder(order: any) {
    return {
      order_id: order.order_id,
      status: order.status,
      total_price: Number(order.totalPrice),
      discount_amount: Number(order.discount_amount),
      created_at: order.created_at,
      discount: order.discount ? { code: order.discount.code } : null,
      items: order.items?.map((item: any) => ({
        order_item_id: item.orderitem_id || item.order_item_id,
        book_id: item.book_id,
        title: item.book.title,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    };
  }

  async create(userId: number, createOrderDto: CreateOrderDto) {
    try {
      const { items, discount_code, ...orderData } = createOrderDto;

      if (!items || items.length === 0) {
        throw new BadRequestException('Cần ít nhất một sản phẩm trong đơn hàng');
      }

      const order = await this.prisma.$transaction(async (tx) => {
        const bookIds = items.map((item) => item.book_id);

        const books = await tx.book.findMany({
          where: { book_id: { in: bookIds } },
        });

        if (books.length !== new Set(bookIds).size) {
          throw new NotFoundException('Một hoặc nhiều sách không tồn tại trong hệ thống');
        }

        let subTotal = 0;

        // for (const item of items) {
        //   const book = books.find((b) => b.book_id === item.book_id)!;

        //   if (book.stock < item.quantity) {
        //     throw new BadRequestException(`Sách "${book.title}" không đủ hàng. Tồn kho: ${book.stock}`);
        //   }

        //   await tx.book.update({
        //     where: { book_id: book.book_id },
        //     data: { stock: { decrement: item.quantity } },
        //   });

        //   subTotal += Number(book.price) * item.quantity;
        // }
        for (const item of items) {
          const book = books.find((b) => b.book_id === item.book_id)!;

          const result = await tx.book.updateMany({
            where: {
              book_id: book.book_id,
              stock: { gte: item.quantity }, // chỉ update nếu đủ hàng
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (result.count === 0) {
            throw new BadRequestException(`Sách "${book.title}" không đủ hàng hoặc đã được mua bởi người khác`);
          }

          subTotal += Number(book.price) * item.quantity;
        }

        let discountAmount = 0;
        let discountId: number | null = null;

        if (discount_code) {
          const discount = await tx.discount.findUnique({
            where: { code: discount_code },
          });

          if (!discount) {
            throw new NotFoundException('Mã giảm giá không tồn tại');
          }

          const now = new Date();

          if (discount.status !== 'ACTIVE') {
            throw new BadRequestException('Mã giảm giá không còn hiệu lực');
          }

          if (now < discount.start_at || now > discount.expires_at) {
            throw new BadRequestException('Mã giảm giá chưa đến hạn hoặc đã hết hạn');
          }

          if (discount.usage_limit !== null && discount.used_count >= discount.usage_limit) {
            throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
          }

          if (discount.min_order_value && subTotal < Number(discount.min_order_value)) {
            throw new BadRequestException(`Đơn hàng tối thiểu ${Number(discount.min_order_value)} mới được áp dụng mã`);
          }

          if (discount.discount_type === 'PERCENTAGE') {
            discountAmount = (subTotal * Number(discount.discount_value)) / 100;

            if (discount.max_discount_amount) {
              discountAmount = Math.min(discountAmount, Number(discount.max_discount_amount));
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
            items: { include: { book: true } },
            discount: true,
          },
        });
      });

      return { message: 'Tạo đơn hàng thành công', order: this.mapOrder(order) };
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Tạo đơn hàng thất bại',
      });
    }
  }

  async findAll() {
    try {
      const orders = await this.prisma.order.findMany({
        include: {
          items: { include: { book: true } },
          discount: true,
        },
        orderBy: { created_at: 'desc' },
      });

      return {
        message: 'Lấy danh sách đơn hàng thành công',
        orders: orders.map((o) => this.mapOrder(o)),
      };
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy danh sách đơn hàng thất bại',
      });
    }
  }

  async findOne(id: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { order_id: id },
        include: {
          items: { include: { book: true } },
          discount: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      return { message: 'Lấy chi tiết đơn hàng thành công', order: this.mapOrder(order) };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Không tìm thấy đơn hàng',
        defaultMessage: 'Lấy chi tiết đơn hàng thất bại',
      });
    }
  }

  async updateStatus(id: number, status: OrderStatus) {
    try {
      const updatedOrder = await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { order_id: id },
          include: { items: true, discount: true },
        });

        if (!order) {
          throw new NotFoundException('Đơn hàng không tồn tại');
        }

        if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
          throw new BadRequestException('Đơn hàng đã ở trạng thái cuối cùng');
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

      return {
        message: 'Cập nhật trạng thái đơn hàng thành công',
        order: this.mapOrder(updatedOrder),
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Đơn hàng không tồn tại',
        defaultMessage: 'Cập nhật trạng thái đơn hàng thất bại',
      });
    }
  }
}
