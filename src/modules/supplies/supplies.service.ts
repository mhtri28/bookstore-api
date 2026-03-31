import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { CreateSupplyBodyDTO } from './dto/create-supply.dto';
import { UpdateSupplyBodyDTO } from './dto/update-supply.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';
import { GetSuppliesQueryDTO } from './dto/get-supplies-query.dto';
import { paginate, paginatedResponse } from 'src/shared/helpers/pagination.helper';
import { CommonStatus, SupplyStatus } from 'src/generated/prisma/enums';

@Injectable()
export class SuppliesService {
  constructor(private readonly prismaService: PrismaService) {}

  private mapSupply(supply: any) {
    return {
      supply_id: supply.supply_id,
      supplier_id: supply.supplier_id,
      total_amount: Number(supply.total_amount),
      imported_at: supply.imported_at,
      status: supply.status,
      supplier: supply.supplier
        ? {
            supplier_id: supply.supplier.supplier_id,
            name: supply.supplier.name,
          }
        : undefined,
      details: supply.details?.map((detail: any) => ({
        supply_detail_id: detail.supply_detail_id,
        book_id: detail.book_id,
        title: detail.book?.title,
        quantity: detail.quantity,
        imported_price: Number(detail.imported_price),
      })),
    };
  }

  async create(body: CreateSupplyBodyDTO) {
    try {
      const supply = await this.prismaService.$transaction(async (tx) => {
        const supplier = await tx.supplier.findUnique({
          where: { supplier_id: body.supplierId },
        });

        if (!supplier) {
          throw new NotFoundException('Nhà cung cấp không tồn tại');
        }

        if (supplier.status !== CommonStatus.ACTIVE) {
          throw new BadRequestException('Nhà cung cấp không hoạt động');
        }

        const bookIds = body.details.map((item) => item.bookId);
        const books = await tx.book.findMany({
          where: { book_id: { in: bookIds } },
          select: { book_id: true },
        });

        const foundBookIds = books.map((book) => book.book_id);
        const notFoundBookIds = bookIds.filter(
          (id) => !foundBookIds.includes(id),
        );

        if (notFoundBookIds.length > 0) {
          throw new BadRequestException(
            `Các bookId không tồn tại: ${notFoundBookIds.join(', ')}`,
          );
        }

        const totalAmount = body.details.reduce(
          (sum, item) => sum + item.quantity * item.importedPrice,
          0,
        );

        return tx.supply.create({
          data: {
            supplier_id: body.supplierId,
            imported_at: body.importedAt ? new Date(body.importedAt) : new Date(),
            total_amount: totalAmount,
            details: {
              create: body.details.map((item) => ({
                book_id: item.bookId,
                quantity: item.quantity,
                imported_price: item.importedPrice,
              })),
            },
          },
          include: {
            details: {
              include: { book: true },
            },
            supplier: true,
          },
        });
      });

      return {
        message: 'Tạo phiếu nhập thành công',
        supply: this.mapSupply(supply),
      };
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Tạo phiếu nhập thất bại',
      });
    }
  }

  async findAll(query: GetSuppliesQueryDTO) {
    try {
      const {
        search,
        status,
        minPrice,
        maxPrice,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = query;

      const where: any = {};

      if (search) {
        where.supply_id = Number(search) || undefined;
      }

      if (status) {
        where.status = status;
      }

      if (minPrice || maxPrice) {
        where.total_amount = {};
        if (minPrice) where.total_amount.gte = minPrice;
        if (maxPrice) where.total_amount.lte = maxPrice;
      }

      if (startDate || endDate) {
        where.imported_at = {};
        if (startDate) where.imported_at.gte = startDate;
        if (endDate) where.imported_at.lte = endDate;
      }

      const [supplies, total] = await Promise.all([
        this.prismaService.supply.findMany({
          where,
          ...paginate(page, limit),
          orderBy: { imported_at: 'desc' },
          include: {
            supplier: {
              select: { supplier_id: true, name: true },
            },
            _count: { select: { details: true } },
          },
        }),
        this.prismaService.supply.count({ where }),
      ]);

      const paginatedData = paginatedResponse(
        supplies.map((supply) => this.mapSupply(supply)),
        total,
        page,
        limit,
      );

      return {
        message: 'Lấy danh sách phiếu nhập thành công',
        data: paginatedData.data,
        meta: paginatedData.meta,
      };
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy danh sách phiếu nhập thất bại',
      });
    }
  }

  async findOne(id: number) {
    try {
      const supply = await this.prismaService.supply.findUnique({
        where: { supply_id: id },
        include: { supplier: true, details: { include: { book: true } } },
      });

      if (!supply) {
        throw new NotFoundException('Phiếu nhập không tồn tại');
      }

      return {
        message: 'Lấy thông tin phiếu nhập thành công',
        supply: this.mapSupply(supply),
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Phiếu nhập không tồn tại',
        defaultMessage: 'Lấy thông tin phiếu nhập thất bại',
      });
    }
  }

  async update(id: number, body: UpdateSupplyBodyDTO) {
    try {
      const supply = await this.prismaService.$transaction(async (tx) => {
        if (!body.details || body.details.length === 0) {
          throw new BadRequestException('Cần ít nhất 1 chi tiết phiếu nhập');
        }

        const currentSupply = await tx.supply.findUnique({
          where: { supply_id: id },
          include: { details: true },
        });

        if (!currentSupply) {
          throw new NotFoundException('Phiếu nhập không tồn tại');
        }

        if (currentSupply.status !== SupplyStatus.PENDING) {
          throw new BadRequestException('Chỉ có thể cập nhật phiếu nhập ở trạng thái chờ');
        }

        const totalAmount = body.details.reduce(
          (sum, item) => sum + item.quantity * item.importedPrice,
          0,
        );

        return tx.supply.update({
          where: { supply_id: id },
          data: {
            imported_at: body.importedAt ? new Date(body.importedAt) : undefined,
            total_amount: totalAmount,
            details: {
              deleteMany: { supply_id: id },
              create: body.details.map((item) => ({
                book_id: item.bookId,
                quantity: item.quantity,
                imported_price: item.importedPrice,
              })),
            },
          },
          include: {
            details: { include: { book: true } },
            supplier: true,
          },
        });
      });

      return {
        message: 'Cập nhật phiếu nhập thành công',
        supply: this.mapSupply(supply),
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Phiếu nhập không tồn tại',
        foreignKeyMessage: 'Book ID không tồn tại',
        defaultMessage: 'Cập nhật phiếu nhập thất bại',
      });
    }
  }

  async cancel(id: number) {
    try {
      const currentSupply = await this.prismaService.supply.findUnique({
        where: { supply_id: id },
      });

      if (!currentSupply) {
        throw new NotFoundException('Phiếu nhập không tồn tại');
      }

      if (currentSupply.status !== SupplyStatus.PENDING) {
        throw new BadRequestException('Chỉ có thể xóa phiếu nhập ở trạng thái chờ');
      }

      await this.prismaService.supply.update({
        where: { supply_id: id },
        data: { status: SupplyStatus.CANCELLED },
      });

      return {
        message: 'Xóa phiếu nhập thành công',
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Phiếu nhập không tồn tại',
        defaultMessage: 'Xóa phiếu nhập thất bại',
      });
    }
  }

  async complete(id: number) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const currentSupply = await tx.supply.findUnique({
          where: { supply_id: id },
          include: { details: true },
        });

        if (!currentSupply) {
          throw new NotFoundException('Phiếu nhập không tồn tại');
        }

        if (currentSupply.status !== SupplyStatus.PENDING) {
          throw new BadRequestException('Chỉ có thể hoàn thành phiếu nhập ở trạng thái chờ');
        }

        await tx.supply.update({
          where: { supply_id: id },
          data: { status: SupplyStatus.DONE },
        });

        for (const detail of currentSupply.details) {
          await tx.book.update({
            where: { book_id: detail.book_id },
            data: { stock: { increment: detail.quantity } },
          });
        }
      });

      return {
        message: 'Hoàn thành phiếu nhập thành công',
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Phiếu nhập không tồn tại',
        defaultMessage: 'Hoàn thành phiếu nhập thất bại',
      });
    }
  }
}