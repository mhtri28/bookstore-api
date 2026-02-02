import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Discount, OrderStatus, Prisma } from '../../generated/prisma/client';
import { ApplyDiscountDto } from 'src/modules/discounts/dto/apply-discount.dto';
import { DiscountsService } from 'src/modules/discounts/discounts.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discountsService: DiscountsService,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { items, discount_code, ...orderData } = createOrderDto;

    if (!items || items.length === 0) {
      throw new HttpException(
        'Cần ít nhất một sản phẩm trong đơn hàng',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.prisma.$transaction(async (tx) => {
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
            `Sách "${book.title}" (ID: ${book.book_id}) không đủ hàng. Tồn kho: ${book.stock}, Yêu cầu: ${item.quantity}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        await tx.book.update({
          where: { book_id: book.book_id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const subTotal = items.reduce((total, item) => {
        const book = books.find((b) => b.book_id === item.book_id);
        return total + Number(book!.price) * item.quantity;
      }, 0);

      let discountAmountValue = 0;
      let discountEntity: Discount | null = null;

      if (discount_code) {
        discountEntity = await tx.discount.findUnique({
          where: { code: discount_code },
        });

        if (!discountEntity) {
          throw new HttpException(
            'Mã giảm giá không tồn tại',
            HttpStatus.NOT_FOUND,
          );
        }

        const applyDiscountDto: ApplyDiscountDto = {
          code: discount_code,
          order_total: subTotal,
        };

        await this.discountsService.applyDiscount(applyDiscountDto);

        const value = Number(discountEntity.discount_value);

        if (discountEntity.discount_type === 'PERCENTAGE') {
          discountAmountValue = (subTotal * value) / 100;

          if (discountEntity.max_discount_amount) {
            const maxDiscount = Number(discountEntity.max_discount_amount);
            discountAmountValue = Math.min(discountAmountValue, maxDiscount);
          }
        } else {
          discountAmountValue = value;
        }

        if (discountAmountValue > subTotal) {
          discountAmountValue = subTotal;
        }
      }

      const finalPrice = Math.max(subTotal - discountAmountValue, 0);

      const order = await tx.order.create({
        data: {
          ...orderData,
          discount_amount: new Prisma.Decimal(discountAmountValue),
          totalPrice: new Prisma.Decimal(finalPrice),
          user: { connect: { user_id: userId } },
          discount: discountEntity
            ? { connect: { code: discount_code } }
            : undefined,
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
      });

      return order;
    });
  }

  async findAll() {
    try {
      return await this.prisma.order.findMany({
        include: {
          items: true,
          discount: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Lấy danh sách đơn hàng thất bại: ' +
          (error instanceof Error ? error.message : 'Lỗi không xác định'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { order_id: id },
        include: {
          items: {
            include: {
              book: true,
            },
          },
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
    } catch (error) {
      throw new HttpException(
        'Lấy thông tin đơn hàng thất bại: ' +
          (error instanceof Error ? error.message : 'Lỗi không xác định'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const { items, ...orderData } = updateOrderDto;

    return await this.prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { order_id: id },
        include: { discount: true },
      });

      if (!currentOrder) {
        throw new HttpException('Đơn hàng không tồn tại', HttpStatus.NOT_FOUND);
      }

      if (currentOrder.status !== 'PENDING') {
        throw new HttpException(
          `Không thể cập nhật đơn hàng đang ở trạng thái ${currentOrder.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (items && items.length > 0) {
        const bookIds = items.map((item) => item.book_id);
        const books = await tx.book.findMany({
          where: { book_id: { in: bookIds } },
        });

        for (const item of items) {
          const book = books.find((b) => b.book_id === item.book_id);
          if (!book) {
            throw new HttpException(
              `Sách với ID ${item.book_id} không tồn tại`,
              HttpStatus.BAD_REQUEST,
            );
          }

          const currentPrice = Number(book.price);

          if (item.order_item_id) {
            const existingItem = await tx.orderItem.findFirst({
              where: {
                orderitem_id: item.order_item_id,
                order_id: id,
              },
            });

            if (!existingItem) {
              throw new HttpException(
                `Order Item ID ${item.order_item_id} không hợp lệ hoặc không thuộc đơn hàng này`,
                HttpStatus.BAD_REQUEST,
              );
            }

            const quantityDiff = item.quantity - existingItem.quantity;

            if (quantityDiff > 0) {
              if (book.stock < quantityDiff) {
                throw new HttpException(
                  `Sách "${book.title}" không đủ hàng để thêm ${quantityDiff} cuốn. Tồn kho hiện tại: ${book.stock}`,
                  HttpStatus.BAD_REQUEST,
                );
              }
              await tx.book.update({
                where: { book_id: book.book_id },
                data: { stock: { decrement: quantityDiff } },
              });
            } else if (quantityDiff < 0) {
              await tx.book.update({
                where: { book_id: book.book_id },
                data: { stock: { increment: Math.abs(quantityDiff) } },
              });
            }

            await tx.orderItem.update({
              where: { orderitem_id: item.order_item_id },
              data: {
                quantity: item.quantity,
                price: currentPrice,
              },
            });
          } else {
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

            await tx.orderItem.create({
              data: {
                order: { connect: { order_id: id } },
                book: { connect: { book_id: item.book_id } },
                quantity: item.quantity,
                price: currentPrice,
              },
            });
          }
        }
      }

      const allItems = await tx.orderItem.findMany({
        where: { order_id: id },
      });

      const newSubTotal = allItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );

      let newDiscountAmount = 0;
      let shouldDisconnectDiscount = false;

      if (currentOrder.discount) {
        const discountInfo = currentOrder.discount;
        const minOrderValue = discountInfo.min_order_value
          ? Number(discountInfo.min_order_value)
          : 0;

        if (newSubTotal < minOrderValue) {
          shouldDisconnectDiscount = true;
          newDiscountAmount = 0;
        } else {
          if (discountInfo.discount_type === 'PERCENTAGE') {
            newDiscountAmount =
              (newSubTotal * Number(discountInfo.discount_value)) / 100;

            if (discountInfo.max_discount_amount) {
              newDiscountAmount = Math.min(
                newDiscountAmount,
                Number(discountInfo.max_discount_amount),
              );
            }
          } else {
            newDiscountAmount = Number(discountInfo.discount_value);
          }

          if (newDiscountAmount > newSubTotal) {
            newDiscountAmount = newSubTotal;
          }
        }
      }

      const newFinalPrice = Math.max(newSubTotal - newDiscountAmount, 0);

      if (shouldDisconnectDiscount && currentOrder.discount) {
        const discountToRefund = currentOrder.discount;
        await tx.order.update({
          where: { order_id: id },
          data: { discount: { disconnect: true } },
        });
        await tx.discount.update({
          where: { discount_id: discountToRefund.discount_id },
          data: {
            used_count: { decrement: 1 },
          },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { order_id: id },
        data: {
          ...orderData,
          totalPrice: new Prisma.Decimal(newFinalPrice),
          discount_amount: new Prisma.Decimal(newDiscountAmount),
        },
        include: {
          items: true,
          discount: true,
        },
      });

      return updatedOrder;
    });
  }

  async updateStatus(id: number, status: OrderStatus) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { order_id: id },
        include: {
          items: true,
          discount: true,
        },
      });

      if (!order) {
        throw new HttpException('Đơn hàng không tồn tại', HttpStatus.NOT_FOUND);
      }

      if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
        throw new HttpException(
          `Đơn hàng đã ở trạng thái cuối cùng (${order.status}), không thể cập nhật`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (status === 'CANCELLED') {
        for (const item of order.items) {
          await tx.book.update({
            where: { book_id: item.book_id },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }

        if (order.discount) {
          await tx.discount.update({
            where: { discount_id: order.discount.discount_id },
            data: {
              used_count: { decrement: 1 },
            },
          });
        }
      }

      const updatedOrder = await tx.order.update({
        where: { order_id: id },
        data: { status: status },
        include: { items: true },
      });

      return updatedOrder;
    });
  }
}
