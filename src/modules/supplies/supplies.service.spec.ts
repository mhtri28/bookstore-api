import { Test, TestingModule } from '@nestjs/testing';
import { SuppliesService } from './supplies.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CommonStatus, SupplyStatus } from 'src/generated/prisma/enums';
import { Prisma } from 'src/generated/prisma/client';

describe('SuppliesService', () => {
  let service: SuppliesService;

  const createSupply = {
    supplierId: 1,
    importedAt: new Date().toISOString(),
    details: [
      { bookId: 1, quantity: 10, importedPrice: 100 },
      { bookId: 2, quantity: 4, importedPrice: 100 },
    ],
  };

  const createdSupply = {
    supply_id: 1,
    supplier_id: createSupply.supplierId,
    imported_at: new Date(createSupply.importedAt),
    total_amount: 1400,
    status: SupplyStatus.PENDING,
  };

  const supplier = {
    supplier_id: 1,
    name: 'Nhà cung cấp 1',
    status: CommonStatus.ACTIVE,
  };

  const books = [{ book_id: 1 }, { book_id: 2 }];

  const dbSupply = {
    ...createdSupply,
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
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
    supply: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    supplier: { findUnique: jest.fn() },
    book: { findMany: jest.fn(), update: jest.fn() },
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

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
  });

  it('service phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('tạo phiếu nhập thành công', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValueOnce(supplier);
      mockPrismaService.book.findMany.mockResolvedValue(books);
      mockPrismaService.supply.create.mockResolvedValue(createdSupply);

      const result = await service.create(createSupply);

      expect(result?.message).toBe('Tạo phiếu nhập thành công');
      expect(result?.supply).toBeDefined();
      expect(result?.supply.supply_id).toBe(1);
    });

    it('ném lỗi nếu nhà cung cấp không tồn tại', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValueOnce(null);
      await expect(service.create(createSupply)).rejects.toThrow('Nhà cung cấp không tồn tại');
    });

    it('ném lỗi nếu nhà cung cấp không hoạt động', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValueOnce({
        ...supplier,
        status: CommonStatus.INACTIVE,
      });
      await expect(service.create(createSupply)).rejects.toThrow('Nhà cung cấp không hoạt động');
    });

    it('ném lỗi nếu có bookId không tồn tại', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValueOnce(supplier);
      mockPrismaService.book.findMany.mockResolvedValueOnce([books[0]]);
      await expect(service.create(createSupply)).rejects.toThrow('Các bookId không tồn tại: 2');
    });
  });

  describe('findAll', () => {
    it('lấy danh sách phiếu nhập thành công', async () => {
      mockPrismaService.supply.findMany.mockResolvedValue([createdSupply]);
      mockPrismaService.supply.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 } as any);
      expect(result?.message).toBe('Lấy danh sách phiếu nhập thành công');
      expect(result?.data).toHaveLength(1);
      expect(result?.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('lấy chi tiết phiếu nhập thành công', async () => {
      mockPrismaService.supply.findUnique.mockResolvedValue(dbSupply);

      const result = await service.findOne(dbSupply.supply_id);
      expect(result?.message).toBe('Lấy thông tin phiếu nhập thành công');
      expect(result?.supply).toBeDefined();
    });

    it('ném lỗi nếu phiếu nhập không tồn tại', async () => {
      mockPrismaService.supply.findUnique.mockResolvedValue(null);
      await expect(service.findOne(dbSupply.supply_id)).rejects.toThrow('Phiếu nhập không tồn tại');
    });
  });

  describe('update', () => {
    it('cập nhật phiếu nhập thành công', async () => {
      const updateBody = {
        details: [{ bookId: 1, quantity: 5, importedPrice: 200 }],
      };

      const updatedDbSupply = { ...dbSupply, total_amount: 1000 };

      mockPrismaService.supply.findUnique.mockResolvedValue(dbSupply);
      mockPrismaService.supply.update.mockResolvedValue(updatedDbSupply);

      const result = await service.update(dbSupply.supply_id, updateBody);

      expect(result?.message).toBe('Cập nhật phiếu nhập thành công');
      expect(result?.supply).toBeDefined();
    });

    it('ném lỗi nếu details trống', async () => {
      await expect(service.update(dbSupply.supply_id, { details: [] })).rejects.toThrow(
        'Cần ít nhất 1 chi tiết phiếu nhập',
      );
    });

    it('ném lỗi nếu trạng thái không phải PENDING', async () => {
      const nonPendingSupply = { ...dbSupply, status: SupplyStatus.DONE };
      mockPrismaService.supply.findUnique.mockResolvedValue(nonPendingSupply);

      await expect(
        service.update(dbSupply.supply_id, { details: [{ bookId: 1, quantity: 5, importedPrice: 200 }] }),
      ).rejects.toThrow('Chỉ có thể cập nhật phiếu nhập ở trạng thái chờ');
    });
  });

  describe('cancel', () => {
    it('xóa phiếu nhập thành công', async () => {
      mockPrismaService.supply.findUnique.mockResolvedValue(dbSupply);
      mockPrismaService.supply.update.mockResolvedValue({ ...dbSupply, status: SupplyStatus.CANCELLED });

      const result = await service.cancel(dbSupply.supply_id);
      expect(result?.message).toEqual('Xóa phiếu nhập thành công');
    });

    it('ném lỗi nếu trạng thái không phải PENDING', async () => {
      const nonPendingSupply = { ...dbSupply, status: SupplyStatus.DONE };
      mockPrismaService.supply.findUnique.mockResolvedValue(nonPendingSupply);

      await expect(service.cancel(dbSupply.supply_id)).rejects.toThrow(
        'Chỉ có thể xóa phiếu nhập ở trạng thái chờ',
      );
    });
  });

  describe('complete', () => {
    it('hoàn thành phiếu nhập và cộng dồn stock', async () => {
      mockPrismaService.supply.findUnique.mockResolvedValue(dbSupply);
      mockPrismaService.supply.update.mockResolvedValue({ ...dbSupply, status: SupplyStatus.DONE });

      const result = await service.complete(dbSupply.supply_id);

      expect(mockPrismaService.book.update).toHaveBeenCalled();
      expect(result?.message).toEqual('Hoàn thành phiếu nhập thành công');
    });

    it('ném lỗi nếu trạng thái không phải PENDING', async () => {
      const nonPendingSupply = { ...dbSupply, status: SupplyStatus.DONE };
      mockPrismaService.supply.findUnique.mockResolvedValue(nonPendingSupply);

      await expect(service.complete(dbSupply.supply_id)).rejects.toThrow(
        'Chỉ có thể hoàn thành phiếu nhập ở trạng thái chờ',
      );
    });
  });
});