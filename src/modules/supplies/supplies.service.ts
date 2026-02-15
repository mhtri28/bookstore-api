import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateSupplyBodyDTO } from './dto/create-supply.dto';
import { UpdateSupplyBodyDTO } from './dto/update-supply.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';
import { GetSuppliesQueryDTO } from 'src/modules/supplies/dto/get-supplies-query.dto';
import { paginate, paginatedResponse } from 'src/shared/helpers/pagination.helper';
import { SupplyModel } from 'src/shared/models/supply.model';
import { SupplyStatus } from 'src/generated/prisma/enums';

@Injectable()
export class SuppliesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(body: CreateSupplyBodyDTO) {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        // 1. Tính tổng tiền
        const totalAmount = body.details.reduce((sum, item) => sum + item.quantity * item.importedPrice, 0);

        // 2. Tạo phiếu nhập & chi tiết phiếu nhập
        const supply = await tx.supply.create({
          data: {
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
              include: {
                book: true,
              },
            },
          },
        });
        return supply;
      });

      const supplyModel = new SupplyModel(result as any);

      return {
        message: 'Tạo phiếu nhập thành công',
        supply: supplyModel,
      };
    } catch (error) {
      handlePrismaError(error, {
        foreignKeyMessage: 'Book ID không tồn tại',
        defaultMessage: 'Tạo phiếu nhập thất bại',
      });
    }
  }

  async findAll(query: GetSuppliesQueryDTO) {
    const { search, status, minPrice, maxPrice, startDate, endDate, page = 1, limit = 10 } = query;

    const where: any = {};

    // Filter id
    if (search) {
      where.supply_id = Number(search) || undefined;
    }

    // Filter status
    if (status) {
      where.status = status;
    }

    // Filter price
    if (minPrice || maxPrice) {
      where.total_amount = {};
      if (minPrice) {
        where.total_amount.gte = minPrice;
      }
      if (maxPrice) {
        where.total_amount.lte = maxPrice;
      }
    }

    // Filter date
    if (startDate || endDate) {
      where.imported_at = {};
      if (startDate) {
        where.imported_at.gte = startDate;
      }
      if (endDate) {
        where.imported_at.lte = endDate;
      }
    }

    const [supplies, total] = await Promise.all([
      this.prismaService.supply.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { imported_at: 'desc' },
        include: { details: { include: { book: true } } },
      }),
      this.prismaService.supply.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách phiếu nhập thành công',
      ...paginatedResponse(
        supplies.map((supply) => new SupplyModel(supply as any)),
        total,
        page,
        limit,
      ),
    };
  }

  async findOne(id: number) {
    try {
      const supply = await this.prismaService.supply.findUniqueOrThrow({
        where: { supply_id: id },
        include: { details: { include: { book: true } } },
      });
      return {
        message: 'Lấy thông tin phiếu nhập thành công',
        supply: new SupplyModel(supply as any),
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
      const result = await this.prismaService.$transaction(async (tx) => {
        // Kiểm tra details có được truyền lên không
        if (!body.details || body.details.length === 0) {
          throw new BadRequestException('Cần ít nhất 1 chi tiết phiếu nhập');
        }

        // Kiểm tra phiếu nhập có tồn tại không
        const currentSupply = await tx.supply.findUniqueOrThrow({
          where: { supply_id: id },
          include: { details: true },
        });

        // Kiểm tra phiếu nhập có đang ở trạng thái chờ không
        if (currentSupply.status !== 'PENDING') {
          throw new ForbiddenException('Chỉ có thể cập nhật phiếu nhập ở trạng thái chờ');
        }

        // 1. Tính tổng tiền mới
        const totalAmount = body.details?.reduce((sum, item) => sum + item.quantity * item.importedPrice, 0);

        // 2. Cập nhật phiếu nhập
        const supply = await tx.supply.update({
          where: { supply_id: id },
          data: {
            imported_at: body.importedAt ? new Date(body.importedAt) : undefined,
            total_amount: totalAmount,
            details: {
              deleteMany: { supply_id: id },
              create: body.details?.map((item) => ({
                book_id: item.bookId,
                quantity: item.quantity,
                imported_price: item.importedPrice,
              })),
            },
          },
          include: {
            details: {
              include: {
                book: true,
              },
            },
          },
        });

        return supply;
      });

      const supplyModel = new SupplyModel(result as any);

      return {
        message: 'Cập nhật phiếu nhập thành công',
        supply: supplyModel,
      };
    } catch (error) {
      handlePrismaError(error, {
        foreignKeyMessage: 'Book ID không tồn tại',
        defaultMessage: 'Cập nhật phiếu nhập thất bại',
      });
    }
  }

  async cancel(id: number) {
    try {
      // 1. Kiểm tra phiếu nhập có tồn tại không
      const currentSupply = await this.prismaService.supply.findUniqueOrThrow({
        where: { supply_id: id },
      });

      // 2. Kiểm tra phiếu nhập có đang ở trạng thái chờ không
      if (currentSupply.status !== SupplyStatus.PENDING) {
        throw new ForbiddenException('Chỉ có thể xóa phiếu nhập ở trạng thái chờ');
      }

      // 3. Cập nhật trạng thái sang CANCELLED
      await this.prismaService.supply.update({
        where: { supply_id: id },
        data: {
          status: SupplyStatus.CANCELLED,
        },
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
      // 1. Kiểm tra phiếu nhập có tồn tại không
      const currentSupply = await this.prismaService.supply.findUniqueOrThrow({
        where: {
          supply_id: id,
        },
      });

      // 2. Kiểm tra phiếu nhập có đang ở trạng thái chờ không
      if (currentSupply.status !== SupplyStatus.PENDING) {
        throw new ForbiddenException('Chỉ có thể hoàn thành phiếu nhập ở trạng thái chờ');
      }

      // 3. Cập nhật trạng thái sang COMPLETED
      await this.prismaService.supply.update({
        where: {
          supply_id: id,
        },
        data: {
          status: SupplyStatus.DONE,
        },
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
