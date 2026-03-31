import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierStatusDto } from './dto/update-status-supplier.dto';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupplierDto) {
    try {
      const supplier = await this.prisma.supplier.create({
        data: {
          name: dto.name,
          email: dto.email ?? null,
          phone: dto.phone ?? null,
          address: dto.address ?? null,
        },
      });

      return { message: 'Tạo nhà cung cấp thành công', supplier };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target?.includes('email')) {
          throw new BadRequestException('Email nhà cung cấp đã tồn tại');
        }
        if (target?.includes('phone')) {
          throw new BadRequestException('Số điện thoại nhà cung cấp đã tồn tại');
        }
      }
      handlePrismaError(error, {
        defaultMessage: 'Tạo nhà cung cấp thất bại',
      });
    }
  }

  async findAll() {
    try {
      const suppliers = await this.prisma.supplier.findMany({
        orderBy: { created_at: 'desc' },
      });

      return { message: 'Lấy danh sách nhà cung cấp thành công', suppliers };
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy danh sách nhà cung cấp thất bại',
      });
    }
  }

  async findOne(id: number) {
    try {
      const supplier = await this.prisma.supplier.findUnique({
        where: { supplier_id: id },
      });

      if (!supplier) {
        throw new NotFoundException('Nhà cung cấp không tồn tại');
      }

      return { message: 'Lấy chi tiết nhà cung cấp thành công', supplier };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Nhà cung cấp không tồn tại',
        defaultMessage: 'Lấy chi tiết nhà cung cấp thất bại',
      });
    }
  }

  async update(id: number, dto: UpdateSupplierDto) {
    try {
      const existingSupplier = await this.prisma.supplier.findUnique({
        where: { supplier_id: id },
      });

      if (!existingSupplier) {
        throw new NotFoundException('Nhà cung cấp không tồn tại');
      }

      const supplier = await this.prisma.supplier.update({
        where: { supplier_id: id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.address !== undefined && { address: dto.address }),
        },
      });

      return { message: 'Cập nhật nhà cung cấp thành công', supplier };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target?.includes('email')) {
          throw new BadRequestException('Email nhà cung cấp đã tồn tại');
        }
        if (target?.includes('phone')) {
          throw new BadRequestException('Số điện thoại nhà cung cấp đã tồn tại');
        }
      }
      handlePrismaError(error, {
        notFoundMessage: 'Nhà cung cấp không tồn tại',
        defaultMessage: 'Cập nhật nhà cung cấp thất bại',
      });
    }
  }

  async updateStatus(id: number, dto: UpdateSupplierStatusDto) {
    try {
      const existingSupplier = await this.prisma.supplier.findUnique({
        where: { supplier_id: id },
      });

      if (!existingSupplier) {
        throw new NotFoundException('Nhà cung cấp không tồn tại');
      }

      const supplier = await this.prisma.supplier.update({
        where: { supplier_id: id },
        data: { status: dto.status },
      });

      return { message: 'Cập nhật trạng thái nhà cung cấp thành công', supplier };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Nhà cung cấp không tồn tại',
        defaultMessage: 'Cập nhật trạng thái nhà cung cấp thất bại',
      });
    }
  }

  async remove(id: number) {
    try {
      const existingSupplier = await this.prisma.supplier.findUnique({
        where: { supplier_id: id },
        select: {
          supplier_id: true,
          _count: { select: { supplies: true } },
        },
      });

      if (!existingSupplier) {
        throw new NotFoundException('Nhà cung cấp không tồn tại');
      }

      if (existingSupplier._count.supplies > 0) {
        throw new BadRequestException('Không thể xoá nhà cung cấp đã từng nhập hàng');
      }

      const supplier = await this.prisma.supplier.delete({
        where: { supplier_id: id },
      });

      return { message: 'Xóa nhà cung cấp thành công', supplier };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Nhà cung cấp không tồn tại',
        defaultMessage: 'Xóa nhà cung cấp thất bại',
      });
    }
  }
}