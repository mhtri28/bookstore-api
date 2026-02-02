import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { CreateDiscountDto } from 'src/modules/discounts/dto/create-discount.dto';
import { UpdateDiscountDto } from 'src/modules/discounts/dto/update-discount.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ApplyDiscountDto } from 'src/modules/discounts/dto/apply-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiscountDto) {
    try {
      const startAt = new Date(dto.start_at);
      const expiresAt = new Date(dto.expires_at);
      if (isNaN(startAt.getTime()) || isNaN(expiresAt.getTime())) {
        throw new HttpException(
          'Ngày bắt đầu hoặc kết thúc không hợp lệ',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (startAt >= expiresAt) {
        throw new HttpException(
          'Ngày kết thúc phải sau ngày bắt đầu',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.prisma.discount.create({
        data: {
          code: dto.code,
          description: dto.description ?? null,
          discount_type: dto.discount_type,
          discount_value: new Prisma.Decimal(dto.discount_value),
          max_discount_amount: dto.max_discount_amount
            ? new Prisma.Decimal(dto.max_discount_amount)
            : null,
          min_order_value: dto.min_order_value
            ? new Prisma.Decimal(dto.min_order_value)
            : null,
          start_at: startAt,
          expires_at: expiresAt,
          used_count: dto.used_count ?? 0,
          usage_limit: dto.usage_limit ?? null,
          status: dto.status ?? 'ACTIVE',
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            'Mã giảm giá đã tồn tại',
            HttpStatus.CONFLICT,
          );
        }
      }
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new HttpException(
        'Lỗi khi tạo mã giảm giá: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.discount.findMany();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new HttpException(
        'Lỗi khi lấy danh sách mã giảm giá: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const discount = await this.prisma.discount.findUnique({
        where: { discount_id: id },
      });
      if (!discount) {
        throw new HttpException(
          'Mã giảm giá không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }
      return discount;
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new HttpException(
        'Lỗi khi tìm mã giảm giá: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, dto: UpdateDiscountDto) {
    let expiresAt: Date | undefined;
    let usageLimit: number | undefined;

    let currentDiscount: { used_count: number } | null;
    try {
      currentDiscount = await this.prisma.discount.findUnique({
        where: { discount_id: id },
        select: {
          used_count: true,
        },
      });
    } catch {
      throw new HttpException(
        'Lỗi khi truy vấn mã giảm giá hiện tại',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!currentDiscount) {
      throw new HttpException(
        'Mã giảm giá không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }

    if (dto.expires_at) {
      expiresAt = new Date(dto.expires_at);
      if (isNaN(expiresAt.getTime())) {
        throw new HttpException(
          'Ngày kết thúc không hợp lệ',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (expiresAt <= new Date()) {
        throw new HttpException(
          'Ngày kết thúc phải sau ngày hiện tại',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.usage_limit) {
      usageLimit = dto.usage_limit;

      if (usageLimit < currentDiscount.used_count) {
        throw new HttpException(
          'Giới hạn sử dụng không được nhỏ hơn số lượt đã sử dụng',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (usageLimit < 0) {
        throw new HttpException(
          'Giới hạn sử dụng không được âm',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    try {
      return await this.prisma.discount.update({
        where: { discount_id: id },
        data: {
          ...(dto.description !== undefined && {
            description: dto.description,
          }),

          ...(expiresAt && { expires_at: expiresAt }),

          ...(dto.max_discount_amount !== undefined && {
            max_discount_amount: dto.max_discount_amount,
          }),

          ...(dto.min_order_value !== undefined && {
            min_order_value: dto.min_order_value,
          }),

          ...(usageLimit !== undefined && {
            usage_limit: usageLimit,
          }),

          ...(dto.status && { status: dto.status }),
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new HttpException(
            'Mã giảm giá không tồn tại',
            HttpStatus.NOT_FOUND,
          );
        }

        if (error.code === 'P2002') {
          throw new HttpException(
            'Dữ liệu cập nhật bị trùng',
            HttpStatus.CONFLICT,
          );
        }
      }

      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';

      throw new HttpException(
        'Lỗi khi cập nhật mã giảm giá: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const discount = await this.prisma.discount.findUnique({
        where: { discount_id: id },
        select: {
          discount_id: true,
          used_count: true,
        },
      });

      if (!discount) {
        throw new HttpException(
          'Mã giảm giá không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      if (discount.used_count > 0) {
        throw new HttpException(
          'Không thể xoá mã giảm giá đã được sử dụng',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.prisma.discount.delete({
        where: { discount_id: id },
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new HttpException(
          'Mã giảm giá không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';

      throw new HttpException(
        'Lỗi khi xoá mã giảm giá: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async applyDiscount(dto: ApplyDiscountDto) {
    const now = new Date();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const discount = await tx.discount.findUnique({
          where: { code: dto.code },
        });

        if (!discount) {
          throw new HttpException(
            'Mã giảm giá không tồn tại',
            HttpStatus.NOT_FOUND,
          );
        }

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
          discount.min_order_value !== null &&
          dto.order_total < Number(discount.min_order_value)
        ) {
          throw new HttpException(
            `Đơn hàng tối thiểu ${Number(discount.min_order_value)} mới được áp dụng mã`,
            HttpStatus.BAD_REQUEST,
          );
        }

        let discountAmount = 0;

        if (discount.discount_type === 'PERCENTAGE') {
          discountAmount =
            (dto.order_total * Number(discount.discount_value)) / 100;

          if (
            discount.max_discount_amount !== null &&
            discountAmount > Number(discount.max_discount_amount)
          ) {
            discountAmount = Number(discount.max_discount_amount);
          }
        } else {
          discountAmount = Number(discount.discount_value);
        }

        if (discountAmount > dto.order_total) {
          discountAmount = dto.order_total;
        }

        await tx.discount.update({
          where: { discount_id: discount.discount_id },
          data: {
            used_count: { increment: 1 },
          },
        });

        return {
          message: 'Áp dụng mã giảm giá thành công',
          discount_code: discount.code,
          discount_amount: discountAmount,
          final_total: dto.order_total - discountAmount,
        };
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';

      throw new HttpException(
        'Lỗi khi áp dụng mã giảm giá: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
