import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockPrisma = {
    book: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    discount: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('service phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('ném lỗi nếu không có sản phẩm', async () => {
      await expect(service.create(1, { items: [] } as any)).rejects.toThrow('Cần ít nhất một sản phẩm trong đơn hàng');
    });

    it('ném lỗi nếu sách không tồn tại', async () => {
      mockPrisma.$transaction.mockImplementation((callback: any) =>
        callback({
          book: { findMany: jest.fn().mockResolvedValue([]) },
        }),
      );

      await expect(service.create(1, { items: [{ book_id: 1, quantity: 1 }] } as any)).rejects.toThrow(
        'Một hoặc nhiều sách không tồn tại trong hệ thống',
      );
    });

    it('tạo đơn hàng thành công không có mã giảm giá', async () => {
      const mockBooks = [{ book_id: 1, title: 'Book A', stock: 10, price: 100 }];

      const mockOrder = {
        order_id: 1,
        status: 'PENDING',
        totalPrice: 100,
        discount_amount: 0,
        items: [{ book_id: 1, quantity: 1, book: mockBooks[0], price: 100 }],
        discount: null,
      };

      mockPrisma.$transaction.mockImplementation((callback: any) =>
        callback({
          book: {
            findMany: jest.fn().mockResolvedValue(mockBooks),
            update: jest.fn().mockResolvedValue({}),
          },
          discount: { findUnique: jest.fn() },
          order: { create: jest.fn().mockResolvedValue(mockOrder) },
        }),
      );

      const result = await service.create(1, {
        items: [{ book_id: 1, quantity: 1 }],
      } as any);

      expect(result.message).toEqual('Tạo đơn hàng thành công');
      expect(result.order.order_id).toBe(1);
      expect(result.order.total_price).toBe(100);
    });
  });

  describe('findOne', () => {
    it('ném lỗi nếu không tìm thấy đơn hàng', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow('Không tìm thấy đơn hàng');
    });

    it('trả về chi tiết đơn hàng thành công', async () => {
      const mockOrder = { order_id: 1, items: [] };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne(1);

      expect(result.message).toEqual('Lấy chi tiết đơn hàng thành công');
      expect(result.order.order_id).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('ném lỗi nếu đơn hàng không tồn tại', async () => {
      mockPrisma.$transaction.mockImplementation((callback: any) =>
        callback({
          order: { findUnique: jest.fn().mockResolvedValue(null) },
        }),
      );

      await expect(service.updateStatus(1, 'CANCELLED' as any)).rejects.toThrow('Đơn hàng không tồn tại');
    });

    it('ném lỗi nếu đơn đã ở trạng thái cuối', async () => {
      mockPrisma.$transaction.mockImplementation((callback: any) =>
        callback({
          order: {
            findUnique: jest.fn().mockResolvedValue({ status: 'COMPLETED' }),
          },
        }),
      );

      await expect(service.updateStatus(1, 'CANCELLED' as any)).rejects.toThrow('Đơn hàng đã ở trạng thái cuối cùng');
    });

    it('hủy đơn hàng thành công và hoàn lại tồn kho', async () => {
      const mockOrder = {
        order_id: 1,
        status: 'PENDING',
        items: [{ book_id: 1, quantity: 2, book: { title: 'A' } }],
        discount: null,
      };

      const mockUpdatedOrder = { ...mockOrder, status: 'CANCELLED' };

      mockPrisma.$transaction.mockImplementation((callback: any) =>
        callback({
          order: {
            findUnique: jest.fn().mockResolvedValue(mockOrder),
            update: jest.fn().mockResolvedValue(mockUpdatedOrder),
          },
          book: { update: jest.fn().mockResolvedValue({}) },
          discount: { update: jest.fn().mockResolvedValue({}) },
        }),
      );

      const result = await service.updateStatus(1, 'CANCELLED' as any);

      expect(result.message).toEqual('Cập nhật trạng thái đơn hàng thành công');
      expect(result.order.status).toBe('CANCELLED');
    });
  });
});
