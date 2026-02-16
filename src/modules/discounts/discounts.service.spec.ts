import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsService } from './discounts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DiscountsService', () => {
  let service: DiscountsService;

  const mockPrisma = {
    discount: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<DiscountsService>(DiscountsService);
    jest.clearAllMocks();
  });

  it('service phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('tạo mã giảm giá thành công', async () => {
      const dto: any = {
        code: 'SALE10',
        description: 'Test',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        start_at: new Date(Date.now() - 1000).toISOString(),
        expires_at: new Date(Date.now() + 100000).toISOString(),
      };

      mockPrisma.discount.create.mockResolvedValue(dto);

      const result = await service.create(dto);

      expect(result).toEqual(dto);
    });

    it('ném lỗi khi ngày kết thúc trước ngày bắt đầu', async () => {
      const dto: any = {
        code: 'SALE10',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        start_at: new Date().toISOString(),
        expires_at: new Date(Date.now() - 1000).toISOString(),
      };

      await expect(service.create(dto)).rejects.toThrow(
        'Ngày kết thúc phải sau ngày bắt đầu',
      );
    });

    it('ném lỗi khi mã giảm giá bị trùng', async () => {
      const dto: any = {
        code: 'SALE10',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        start_at: new Date(Date.now() - 1000).toISOString(),
        expires_at: new Date(Date.now() + 100000).toISOString(),
      };

      mockPrisma.discount.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(service.create(dto)).rejects.toThrow(
        'Mã giảm giá đã tồn tại',
      );
    });
  });

  describe('remove', () => {
    it('xóa thành công nếu chưa sử dụng', async () => {
      mockPrisma.discount.findUnique.mockResolvedValue({
        discount_id: 1,
        used_count: 0,
      });

      mockPrisma.discount.delete.mockResolvedValue({ discount_id: 1 });

      const result = await service.remove(1);

      expect(result).toEqual({ discount_id: 1 });
    });

    it('ném lỗi nếu mã giảm giá đã được sử dụng', async () => {
      mockPrisma.discount.findUnique.mockResolvedValue({
        discount_id: 1,
        used_count: 3,
      });

      await expect(service.remove(1)).rejects.toThrow(
        'Không thể xoá mã giảm giá đã sử dụng',
      );
    });
  });

  describe('applyDiscount', () => {
    it('áp dụng giảm giá phần trăm thành công', async () => {
      const mockDiscount = {
        discount_id: 1,
        code: 'SALE10',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        max_discount_amount: null,
        min_order_value: null,
        start_at: new Date(Date.now() - 1000),
        expires_at: new Date(Date.now() + 100000),
        usage_limit: null,
        used_count: 0,
        status: 'ACTIVE',
      };

      mockPrisma.$transaction.mockImplementation((callback: any) =>
        callback({
          discount: {
            findUnique: jest.fn().mockResolvedValue(mockDiscount),
            update: jest.fn().mockResolvedValue({}),
          },
        }),
      );

      const result = await service.applyDiscount({
        code: 'SALE10',
        order_total: 100,
      });

      expect(result.discount_amount).toBe(10);
      expect(result.final_total).toBe(90);
    });

    it('ném lỗi khi mã giảm giá không tồn tại', async () => {
      mockPrisma.$transaction.mockImplementation((callback: any) =>
        callback({
          discount: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        }),
      );

      await expect(
        service.applyDiscount({ code: 'ABC', order_total: 100 }),
      ).rejects.toThrow('Mã giảm giá không tồn tại');
    });

    it('ném lỗi khi mã giảm giá hết lượt', async () => {
      const mockDiscount = {
        discount_id: 1,
        code: 'SALE10',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        max_discount_amount: null,
        min_order_value: null,
        start_at: new Date(Date.now() - 1000),
        expires_at: new Date(Date.now() + 100000),
        usage_limit: 1,
        used_count: 1,
        status: 'ACTIVE',
      };

      mockPrisma.$transaction.mockImplementation((callback: any) =>
        callback({
          discount: {
            findUnique: jest.fn().mockResolvedValue(mockDiscount),
          },
        }),
      );

      await expect(
        service.applyDiscount({ code: 'SALE10', order_total: 100 }),
      ).rejects.toThrow('Mã giảm giá đã hết lượt');
    });
  });
});
