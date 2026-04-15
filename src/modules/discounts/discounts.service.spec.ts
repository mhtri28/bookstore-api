import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsService } from './discounts.service';
import { PrismaService } from '../prisma/prisma.service';
import * as helper from 'src/shared/helpers/handle-prisma-error.helper';

describe('DiscountsService', () => {
  let service: DiscountsService;

  const mockDiscountData = {
    discount_id: 1,
    code: 'SALE10',
    description: 'Test',
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

  const mockPrismaService = {
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
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DiscountsService>(DiscountsService);
  });

  it('phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: any = {
      code: 'SALE10',
      description: 'Test',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      start_at: new Date(Date.now() - 1000).toISOString(),
      expires_at: new Date(Date.now() + 100000).toISOString(),
      used_count: 0,
    };

    it('tạo mã giảm giá thành công', async () => {
      mockPrismaService.discount.create.mockResolvedValue(mockDiscountData);

      const result = await service.create(createDto);

      expect(result).toEqual({ message: 'Tạo mã giảm giá thành công', discount: mockDiscountData });
      expect(mockPrismaService.discount.create).toHaveBeenCalled();
    });

    it('ném lỗi khi ngày kết thúc trước ngày bắt đầu', async () => {
      const invalidDto: any = {
        ...createDto,
        start_at: new Date().toISOString(),
        expires_at: new Date(Date.now() - 1000).toISOString(),
      };

      await expect(service.create(invalidDto)).rejects.toThrow('Ngày kết thúc phải sau ngày bắt đầu');
    });

    it('gọi handlePrismaError khi tạo mã giảm giá thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.discount.create.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.create(createDto)).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Tạo mã giảm giá thất bại',
      });
    });
  });

  describe('remove', () => {
    it('xóa mã giảm giá thành công nếu chưa sử dụng', async () => {
      mockPrismaService.discount.findUnique.mockResolvedValue({
        discount_id: 1,
        used_count: 0,
      });
      mockPrismaService.discount.delete.mockResolvedValue(mockDiscountData);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Xóa mã giảm giá thành công', discount: mockDiscountData });
      expect(mockPrismaService.discount.delete).toHaveBeenCalledWith({
        where: { discount_id: 1 },
      });
    });

    it('ném lỗi nếu mã giảm giá đã được sử dụng', async () => {
      mockPrismaService.discount.findUnique.mockResolvedValue({
        discount_id: 1,
        used_count: 3,
      });

      await expect(service.remove(1)).rejects.toThrow('Không thể xoá mã giảm giá đã sử dụng');
    });

    it('ném lỗi khi mã giảm giá không tồn tại', async () => {
      mockPrismaService.discount.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove(99)).rejects.toThrow('Mã giảm giá không tồn tại');
    });
  });

  describe('applyDiscount', () => {
    it('áp dụng giảm giá phần trăm thành công', async () => {
      mockPrismaService.$transaction.mockImplementation((callback: any) =>
        callback({
          discount: {
            findUnique: jest.fn().mockResolvedValue(mockDiscountData),
            update: jest.fn().mockResolvedValue({}),
          },
        }),
      );

      const result = await service.applyDiscount({
        code: 'SALE10',
        order_total: 100,
      });

      expect(result).toEqual({
        message: 'Áp dụng mã giảm giá thành công',
        discount_amount: 10,
        final_total: 90,
      });
    });

    it('ném lỗi khi mã giảm giá không tồn tại', async () => {
      mockPrismaService.$transaction.mockImplementation((callback: any) =>
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

    it('ném lỗi khi mã giảm giá đã hết lượt', async () => {
      const exhaustedDiscount = { ...mockDiscountData, usage_limit: 1, used_count: 1 };

      mockPrismaService.$transaction.mockImplementation((callback: any) =>
        callback({
          discount: {
            findUnique: jest.fn().mockResolvedValue(exhaustedDiscount),
          },
        }),
      );

      await expect(
        service.applyDiscount({ code: 'SALE10', order_total: 100 }),
      ).rejects.toThrow('Mã giảm giá đã hết lượt');
    });
  });
});