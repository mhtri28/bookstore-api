import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class DiscountsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateDiscountDto) {
    try {
      const startAt = new Date(dto.start_at);
      const expiresAt = new Date(dto.expires_at);

      if (isNaN(startAt.getTime()) || isNaN(expiresAt.getTime())) {
        throw new BadRequestException('Ngày không hợp lệ');
      }

      if (startAt >= expiresAt) {
        throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
      }

      const discount = await this.prismaService.discount.create({
        data: {
          ...dto,
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
        },
      });

      return { message: 'Tạo mã giảm giá thành công', discount };
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Tạo mã giảm giá thất bại',
      });
    }
  }

  async findAll() {
    try {
      const discounts = await this.prismaService.discount.findMany({
        orderBy: { start_at: 'desc' },
      });

      return {
        message: 'Lấy danh sách mã giảm giá thành công',
        discounts,
      };
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy danh sách mã giảm giá thất bại',
      });
    }
  }

  async findOne(id: number) {
    try {
      const discount = await this.prismaService.discount.findUnique({
        where: { discount_id: id },
      });

      if (!discount) {
        throw new NotFoundException('Mã giảm giá không tồn tại');
      }

      return { message: 'Lấy chi tiết mã giảm giá thành công', discount };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Mã giảm giá không tồn tại',
        defaultMessage: 'Lấy chi tiết mã giảm giá thất bại',
      });
    }
  }

  async update(id: number, dto: UpdateDiscountDto) {
    try {
      const existing = await this.prismaService.discount.findUnique({
        where: { discount_id: id },
      });

      if (!existing) {
        throw new NotFoundException('Mã giảm giá không tồn tại');
      }

      if (dto.usage_limit !== undefined && dto.usage_limit < existing.used_count) {
        throw new BadRequestException('Giới hạn sử dụng nhỏ hơn số lượt đã dùng');
      }

      const dataToUpdate: any = { ...dto };
      if (dto.start_at) dataToUpdate.start_at = new Date(dto.start_at);
      if (dto.expires_at) dataToUpdate.expires_at = new Date(dto.expires_at);
      if (dto.discount_value !== undefined) dataToUpdate.discount_value = new Prisma.Decimal(dto.discount_value);
      if (dto.max_discount_amount !== undefined) dataToUpdate.max_discount_amount = new Prisma.Decimal(dto.max_discount_amount);
      if (dto.min_order_value !== undefined) dataToUpdate.min_order_value = new Prisma.Decimal(dto.min_order_value);

      const discount = await this.prismaService.discount.update({
        where: { discount_id: id },
        data: dataToUpdate,
      });

      return { message: 'Cập nhật mã giảm giá thành công', discount };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Mã giảm giá không tồn tại',
        defaultMessage: 'Cập nhật mã giảm giá thất bại',
      });
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.prismaService.discount.findUnique({
        where: { discount_id: id },
      });

      if (!existing) {
        throw new NotFoundException('Mã giảm giá không tồn tại');
      }

      if (existing.used_count > 0) {
        throw new BadRequestException('Không thể xoá mã giảm giá đã sử dụng');
      }

      const discount = await this.prismaService.discount.delete({
        where: { discount_id: id },
      });

      return { message: 'Xóa mã giảm giá thành công', discount };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Mã giảm giá không tồn tại',
        defaultMessage: 'Xóa mã giảm giá thất bại',
      });
    }
  }

  async applyDiscount(dto: ApplyDiscountDto) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const discount = await tx.discount.findUnique({
          where: { code: dto.code },
        });

        if (!discount) {
          throw new NotFoundException('Mã giảm giá không tồn tại');
        }

        const now = new Date();

        if (
          discount.status !== 'ACTIVE' ||
          now < discount.start_at ||
          now > discount.expires_at
        ) {
          throw new BadRequestException('Mã giảm giá không hợp lệ');
        }

        if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
          throw new BadRequestException('Mã giảm giá đã hết lượt');
        }

        let discountAmount = 0;

        if (discount.discount_type === 'PERCENTAGE') {
          discountAmount = (dto.order_total * Number(discount.discount_value)) / 100;

          if (discount.max_discount_amount) {
            discountAmount = Math.min(
              discountAmount,
              Number(discount.max_discount_amount),
            );
          }
        } else {
          discountAmount = Number(discount.discount_value);
        }

        discountAmount = Math.min(discountAmount, dto.order_total);

        await tx.discount.update({
          where: { discount_id: discount.discount_id },
          data: { used_count: { increment: 1 } },
        });

        return {
          message: 'Áp dụng mã giảm giá thành công',
          discount_amount: discountAmount,
          final_total: dto.order_total - discountAmount,
        };
      });
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Mã giảm giá không tồn tại',
        defaultMessage: 'Áp dụng mã giảm giá thất bại',
      });
    }
  }
}