import { Test, TestingModule } from '@nestjs/testing';
import { SuppliesService } from './supplies.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CommonStatus, SupplyStatus } from 'src/generated/prisma/browser';
import { SupplyModel } from 'src/shared/models/supply.model';
import { Prisma } from 'src/generated/prisma/client';
import { prismaNotFoundError } from 'src/test/utils/prisma-test-errors';

describe('SuppliesService', () => {
  let service: SuppliesService;

  const createSupply = {
    supplierId: 1,
    importedAt: new Date().toISOString(),
    details: [
      {
        bookId: 1,
        quantity: 10,
        importedPrice: 100,
      },
      {
        bookId: 2,
        quantity: 4,
        importedPrice: 100,
      },
    ],
  };

  const createdSupply = {
    supply_id: 1,
    supplier_id: createSupply.supplierId,
    imported_at: new Date(createSupply.importedAt),
    total_amount: 1400,
  };

  const supplier = {
    name: 'Nhà cung cấp 1',
    email: 'ncc1@example.com',
    status: CommonStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
    phone: '0123456789',
    supplier_id: 1,
  };

  const books = [
    {
      book_id: 1,
    },
    {
      book_id: 2,
    },
  ];

  const dbSupply = {
    supply_id: 1,
    supplier_id: createdSupply.supplier_id,
    imported_at: new Date(createdSupply.imported_at),
    updated_at: new Date(),
    total_amount: 1400,
    status: SupplyStatus.PENDING,
    supplier: { supplier_id: 1, name: 'Nhà cung cấp 1' },
    details: [
      {
        supply_detail_id: 1,
        book_id: 1,
        supply_id: 1,
        quantity: 10,
        imported_price: new Prisma.Decimal(100),
        book: { book_id: 1, title: 'Book 1' },
      },
    ],
    _count: { details: 1 },
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
    supply: {
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    supplier: {
      findUnique: jest.fn(),
    },
    book: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SuppliesService>(SuppliesService);

    mockPrismaService.$transaction.mockImplementation((cb: any) => {
      return cb({
        supply: mockPrismaService.supply,
        supplier: mockPrismaService.supplier,
        book: mockPrismaService.book,
      });
    });

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create supply successfully', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValueOnce(supplier);
      mockPrismaService.book.findMany.mockResolvedValue(books);
      mockPrismaService.supply.create.mockResolvedValue(createdSupply);

      const result = await service.create(createSupply);

      expect(mockPrismaService.supplier.findUnique).toHaveBeenCalledWith({
        where: { supplier_id: createSupply.supplierId },
      });
      expect(mockPrismaService.book.findMany).toHaveBeenCalledWith({
        where: { book_id: { in: createSupply.details.map((d) => d.bookId) } },
        select: { book_id: true },
      });
      expect(mockPrismaService.supply.create).toHaveBeenCalledWith({
        data: {
          supplier_id: createSupply.supplierId,
          imported_at: new Date(createSupply.importedAt),
          total_amount: 1400,
          details: {
            create: createSupply.details.map((item) => ({
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
      expect(result.message).toBe('Tạo phiếu nhập thành công');
      expect(result.supply).toBeInstanceOf(SupplyModel);
      expect(result.supply).toMatchObject({
        supply_id: createdSupply.supply_id,
        supplier_id: createdSupply.supplier_id,
        total_amount: 1400,
      });
    });

    it("should create supply fail if supplier doesn't exist", async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValueOnce(null);
      await expect(service.create(createSupply)).rejects.toThrow('Nhà cung cấp không tồn tại');
    });

    it('should create supply fail if supplier is not active', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValueOnce({ ...supplier, status: CommonStatus.INACTIVE });
      await expect(service.create(createSupply)).rejects.toThrow('Nhà cung cấp không hoạt động');
    });

    it("should create supply fail if some bookId doesn't exist", async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValueOnce(supplier);
      mockPrismaService.book.findMany.mockResolvedValueOnce([books[0]]);
      await expect(service.create(createSupply)).rejects.toThrow('Các bookId không tồn tại: 2');
    });
  });

  describe('findAll', () => {
    it('should find all supplies successfully', async () => {
      mockPrismaService.supply.findMany.mockResolvedValue([createdSupply]);
      mockPrismaService.supply.count.mockResolvedValue(1);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.message).toBe('Lấy danh sách phiếu nhập thành công');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(SupplyModel);
      expect(result.data[0]).toMatchObject({
        supply_id: createdSupply.supply_id,
        total_amount: 1400,
      });
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by supply id when search is provided', async () => {
      mockPrismaService.supply.findMany.mockResolvedValue([]);
      mockPrismaService.supply.count.mockResolvedValue(0);

      await service.findAll({ search: '10', page: 1, limit: 10 });

      expect(mockPrismaService.supply.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { supply_id: 10 },
        }),
      );
      expect(mockPrismaService.supply.count).toHaveBeenCalledWith({
        where: {
          supply_id: 10,
        },
      });
    });

    it('should filter by status when status is provided', async () => {
      mockPrismaService.supply.findMany.mockResolvedValue([]);
      mockPrismaService.supply.count.mockResolvedValue(0);
      await service.findAll({ status: SupplyStatus.PENDING, page: 1, limit: 10 });

      expect(mockPrismaService.supply.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: SupplyStatus.PENDING },
        }),
      );
      expect(mockPrismaService.supply.count).toHaveBeenCalledWith({
        where: {
          status: SupplyStatus.PENDING,
        },
      });
    });

    it('should filter by price when price is provided', async () => {
      mockPrismaService.supply.findMany.mockResolvedValue([]);
      mockPrismaService.supply.count.mockResolvedValue(0);
      await service.findAll({ minPrice: 10000, maxPrice: 50000, page: 1, limit: 10 });

      expect(mockPrismaService.supply.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { total_amount: { gte: 10000, lte: 50000 } },
        }),
      );
      expect(mockPrismaService.supply.count).toHaveBeenCalledWith({
        where: {
          total_amount: { gte: 10000, lte: 50000 },
        },
      });
    });

    it('should filter by date when date is provided', async () => {
      mockPrismaService.supply.findMany.mockResolvedValue([]);
      mockPrismaService.supply.count.mockResolvedValue(0);
      await service.findAll({ startDate: new Date('2023-01-01'), endDate: new Date('2023-12-31'), page: 1, limit: 10 });

      expect(mockPrismaService.supply.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { imported_at: { gte: new Date('2023-01-01'), lte: new Date('2023-12-31') } },
        }),
      );
      expect(mockPrismaService.supply.count).toHaveBeenCalledWith({
        where: {
          imported_at: { gte: new Date('2023-01-01'), lte: new Date('2023-12-31') },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should find supply successfully', async () => {
      mockPrismaService.supply.findUniqueOrThrow.mockResolvedValue(dbSupply);

      const result = await service.findOne(dbSupply.supply_id);

      expect(mockPrismaService.supply.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { supply_id: dbSupply.supply_id },
        include: { supplier: true, details: { include: { book: true } } },
      });
      expect(result.message).toBe('Lấy thông tin phiếu nhập thành công');
      expect(result.supply).toBeInstanceOf(SupplyModel);
      expect(result.supply).toMatchObject({
        supply_id: dbSupply.supply_id,
        supplier_id: dbSupply.supplier_id,
        total_amount: 1400,
        status: SupplyStatus.PENDING,
        supplier: {
          supplier_id: dbSupply.supplier.supplier_id,
          name: dbSupply.supplier.name,
        },
        _count: { details: 1 },
      });
      expect(result.supply.details?.[0]).toMatchObject({
        supply_detail_id: dbSupply.details[0].supply_detail_id,
        book_id: dbSupply.details[0].book_id,
        quantity: dbSupply.details[0].quantity,
        imported_price: 100,
      });
    });

    it('should find supply fail if supply not found', async () => {
      mockPrismaService.supply.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.findOne(dbSupply.supply_id)).rejects.toThrow('Phiếu nhập không tồn tại');
    });
  });

  describe('update', () => {
    it('should update supply successfully', async () => {
      const updateBody = {
        importedAt: new Date().toISOString(),
        details: [
          {
            bookId: 1,
            quantity: 5,
            importedPrice: 200,
          },
        ],
      };

      const updatedDbSupply = {
        ...dbSupply,
        imported_at: new Date(updateBody.importedAt),
        total_amount: 5 * 200,
        details: [
          {
            supply_detail_id: 1,
            book_id: 1,
            supply_id: dbSupply.supply_id,
            quantity: 5,
            imported_price: new Prisma.Decimal(200),
            book: { book_id: 1, title: 'Book 1' },
          },
        ],
      };

      mockPrismaService.supply.findUniqueOrThrow.mockResolvedValue(dbSupply);
      mockPrismaService.supply.update.mockResolvedValue(updatedDbSupply);

      const result = await service.update(dbSupply.supply_id, updateBody);

      expect(mockPrismaService.supply.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { supply_id: dbSupply.supply_id },
        include: { details: true },
      });
      expect(mockPrismaService.supply.update).toHaveBeenCalledWith({
        where: { supply_id: dbSupply.supply_id },
        data: {
          imported_at: new Date(updateBody.importedAt),
          total_amount: 1000,
          details: {
            deleteMany: { supply_id: dbSupply.supply_id },
            create: [
              {
                book_id: 1,
                quantity: 5,
                imported_price: 200,
              },
            ],
          },
        },
        include: {
          details: { include: { book: true } },
        },
      });

      expect(result.message).toBe('Cập nhật phiếu nhập thành công');
      expect(result.supply).toBeInstanceOf(SupplyModel);
      expect(result.supply).toMatchObject({
        supply_id: dbSupply.supply_id,
        total_amount: 1000,
      });
      expect(result.supply.details?.[0]).toMatchObject({
        book_id: 1,
        quantity: 5,
        imported_price: 200,
      });
    });

    it('should update supply fail if detail is empty', async () => {
      const updateBody = {
        importedAt: new Date().toISOString(),
        details: [],
      };
      await expect(service.update(dbSupply.supply_id, updateBody)).rejects.toThrow('Cần ít nhất 1 chi tiết phiếu nhập');
      expect(mockPrismaService.supply.update).not.toHaveBeenCalled();
    });

    it('should update supply fail if status is not PENDING', async () => {
      const updateBody = {
        importedAt: new Date().toISOString(),
        details: [
          {
            bookId: 1,
            quantity: 5,
            importedPrice: 200,
          },
        ],
      };
      const nonPendingSupply = {
        ...dbSupply,
        status: SupplyStatus.DONE,
      };
      mockPrismaService.supply.findUniqueOrThrow.mockResolvedValue(nonPendingSupply);
      await expect(service.update(dbSupply.supply_id, updateBody)).rejects.toThrow(
        'Chỉ có thể cập nhật phiếu nhập ở trạng thái chờ',
      );
      expect(mockPrismaService.supply.update).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel supply successfully', async () => {
      const cancelledDbSupply = {
        ...dbSupply,
        status: SupplyStatus.CANCELLED,
      };
      mockPrismaService.supply.findUniqueOrThrow.mockResolvedValue(dbSupply);
      mockPrismaService.supply.update.mockResolvedValue(cancelledDbSupply);

      const result = await service.cancel(dbSupply.supply_id);

      expect(mockPrismaService.supply.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { supply_id: dbSupply.supply_id },
      });
      expect(mockPrismaService.supply.update).toHaveBeenCalledWith({
        where: { supply_id: dbSupply.supply_id },
        data: {
          status: SupplyStatus.CANCELLED,
        },
      });
      expect(result.message).toEqual('Xóa phiếu nhập thành công');
    });

    it('should cancel supply fail if status is pending', async () => {
      const nonPendingSupply = {
        ...dbSupply,
        status: SupplyStatus.DONE,
      };
      mockPrismaService.supply.findUniqueOrThrow.mockResolvedValue(nonPendingSupply);
      await expect(service.cancel(dbSupply.supply_id)).rejects.toThrow('Chỉ có thể xóa phiếu nhập ở trạng thái chờ');
      expect(mockPrismaService.supply.update).not.toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete supply successfully', async () => {
      mockPrismaService.supply.findUniqueOrThrow.mockResolvedValue(dbSupply);
      mockPrismaService.supply.update.mockResolvedValue({ ...dbSupply, status: SupplyStatus.DONE });
      mockPrismaService.book.update.mockResolvedValue({ book_id: 1, title: 'Book 1', quantity: 0 });

      const result = await service.complete(dbSupply.supply_id);

      expect(mockPrismaService.supply.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { supply_id: dbSupply.supply_id },
        include: {
          details: true,
        },
      });
      expect(mockPrismaService.supply.update).toHaveBeenCalledWith({
        where: { supply_id: dbSupply.supply_id },
        data: {
          status: SupplyStatus.DONE,
        },
      });
      expect(mockPrismaService.book.update).toHaveBeenCalledWith({
        where: { book_id: dbSupply.details[0].book_id },
        data: {
          stock: {
            increment: dbSupply.details[0].quantity,
          },
        },
      });
      expect(result.message).toEqual('Hoàn thành phiếu nhập thành công');
    });

    it('should complete supply fail if status is not pending', async () => {
      const nonPendingSupply = {
        ...dbSupply,
        status: SupplyStatus.DONE,
      };
      mockPrismaService.supply.findUniqueOrThrow.mockResolvedValue(nonPendingSupply);
      await expect(service.complete(dbSupply.supply_id)).rejects.toThrow(
        'Chỉ có thể hoàn thành phiếu nhập ở trạng thái chờ',
      );
      expect(mockPrismaService.supply.update).not.toHaveBeenCalled();
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
    });

    it('should complete supply fail if supply not found', async () => {
      mockPrismaService.supply.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.complete(dbSupply.supply_id)).rejects.toThrow('Phiếu nhập không tồn tại');
      expect(mockPrismaService.supply.update).not.toHaveBeenCalled();
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
    });
  });
});
