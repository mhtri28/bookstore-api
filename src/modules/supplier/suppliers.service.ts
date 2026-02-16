import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierStatusDto } from 'src/modules/supplier/dto/update-status-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSupplierDto) {
    try {
      return await this.prisma.supplier.create({
        data: {
          name: dto.name,
          email: dto.email ?? null,
          phone: dto.phone ?? null,
          address: dto.address ?? null,
        },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[];

          if (target?.includes('email')) {
            throw new HttpException(
              'Email nhà cung cấp đã tồn tại',
              HttpStatus.CONFLICT,
            );
          }

          if (target?.includes('phone')) {
            throw new HttpException(
              'Số điện thoại nhà cung cấp đã tồn tại',
              HttpStatus.CONFLICT,
            );
          }
        }
      }

      throw new HttpException(
        'Lỗi khi tạo nhà cung cấp',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.supplier.findMany({
        orderBy: { created_at: 'desc' },
      });
    } catch {
      throw new HttpException(
        'Lỗi khi lấy danh sách nhà cung cấp',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { supplier_id: id },
    });

    if (!supplier) {
      throw new HttpException(
        'Nhà cung cấp không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }

    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto) {
    await this.findOne(id);

    try {
      return await this.prisma.supplier.update({
        where: { supplier_id: id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.address !== undefined && { address: dto.address }),
        },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[];

          if (target?.includes('email')) {
            throw new HttpException(
              'Email nhà cung cấp đã tồn tại',
              HttpStatus.CONFLICT,
            );
          }

          if (target?.includes('phone')) {
            throw new HttpException(
              'Số điện thoại nhà cung cấp đã tồn tại',
              HttpStatus.CONFLICT,
            );
          }
        }
      }

      throw new HttpException(
        'Lỗi khi cập nhật nhà cung cấp',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStatus(id: number, dto: UpdateSupplierStatusDto) {
    await this.findOne(id);

    return this.prisma.supplier.update({
      where: { supplier_id: id },
      data: { status: dto.status },
    });
  }

  async remove(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { supplier_id: id },
      select: {
        supplier_id: true,
        _count: {
          select: { supplies: true },
        },
      },
    });

    if (!supplier) {
      throw new HttpException(
        'Nhà cung cấp không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }

    if (supplier._count.supplies > 0) {
      throw new HttpException(
        'Không thể xoá nhà cung cấp đã từng nhập hàng',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.supplier.delete({
      where: { supplier_id: id },
    });
  }
}
