import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyDiscountDto } from './dto/apply-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiscountDto) {
    const startAt = new Date(dto.start_at);
    const expiresAt = new Date(dto.expires_at);

    if (isNaN(startAt.getTime()) || isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Ngày không hợp lệ');
    }

    if (startAt >= expiresAt) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    try {
      return await this.prisma.discount.create({
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
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Mã giảm giá đã tồn tại');
      }
      throw new InternalServerErrorException('Lỗi khi tạo mã giảm giá');
    }
  }

  async findAll() {
    return this.prisma.discount.findMany();
  }

  async findOne(id: number) {
    const discount = await this.prisma.discount.findUnique({
      where: { discount_id: id },
    });

    if (!discount) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }

    return discount;
  }

  async update(id: number, dto: UpdateDiscountDto) {
    const existing = await this.findOne(id);

    if (dto.usage_limit !== undefined) {
      if (dto.usage_limit < existing.used_count) {
        throw new BadRequestException(
          'Giới hạn sử dụng nhỏ hơn số lượt đã dùng',
        );
      }
    }

    return this.prisma.discount.update({
      where: { discount_id: id },
      data: dto,
    });
  }

  async remove(id: number) {
    const discount = await this.findOne(id);

    if (discount.used_count > 0) {
      throw new BadRequestException(
        'Không thể xoá mã giảm giá đã sử dụng',
      );
    }

    return this.prisma.discount.delete({
      where: { discount_id: id },
    });
  }

  async applyDiscount(dto: ApplyDiscountDto) {
    return this.prisma.$transaction(async (tx) => {
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

      if (
        discount.usage_limit &&
        discount.used_count >= discount.usage_limit
      ) {
        throw new BadRequestException('Mã giảm giá đã hết lượt');
      }

      let discountAmount = 0;

      if (discount.discount_type === 'PERCENTAGE') {
        discountAmount =
          (dto.order_total * Number(discount.discount_value)) / 100;

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
        discount_amount: discountAmount,
        final_total: dto.order_total - discountAmount,
      };
    });
  }
}