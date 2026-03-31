import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import * as helper from 'src/shared/helpers/handle-prisma-error.helper';
import { BadRequestException } from '@nestjs/common';

describe('SuppliersService', () => {
  let service: SuppliersService;

  const mockPrisma = {
    supplier: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  it('service phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: any = {
      name: 'Supplier A',
      email: 'a@test.com',
      phone: '0123456789',
    };

    it('tạo nhà cung cấp thành công', async () => {
      mockPrisma.supplier.create.mockResolvedValue(dto);

      const result = await service.create(dto);

      expect(result).toEqual({ message: 'Tạo nhà cung cấp thành công', supplier: dto });
    });

    it('ném lỗi khi email bị trùng', async () => {
      mockPrisma.supplier.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '1',
          meta: { target: ['email'] },
        }),
      );

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Email nhà cung cấp đã tồn tại');
    });

    it('ném lỗi khi phone bị trùng', async () => {
      mockPrisma.supplier.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '1',
          meta: { target: ['phone'] },
        }),
      );

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Số điện thoại nhà cung cấp đã tồn tại');
    });

    it('gọi handlePrismaError khi lỗi khác xảy ra', async () => {
      const dbError = new Error('Lỗi chung');
      const handledError = new Error('Handled error');

      mockPrisma.supplier.create.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.create(dto)).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Tạo nhà cung cấp thất bại',
      });
    });
  });

  describe('findOne', () => {
    it('ném lỗi nếu nhà cung cấp không tồn tại', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow('Nhà cung cấp không tồn tại');
    });

    it('trả về chi tiết nhà cung cấp thành công', async () => {
      const supplier = { supplier_id: 1, name: 'A' };
      mockPrisma.supplier.findUnique.mockResolvedValue(supplier);

      const result = await service.findOne(1);

      expect(result).toEqual({ message: 'Lấy chi tiết nhà cung cấp thành công', supplier });
    });
  });

  describe('update', () => {
    it('cập nhật thành công', async () => {
      const supplier = { supplier_id: 1, name: 'Old' };
      mockPrisma.supplier.findUnique.mockResolvedValue(supplier);
      mockPrisma.supplier.update.mockResolvedValue({ supplier_id: 1, name: 'New' });

      const result = await service.update(1, { name: 'New' });

      expect(result.supplier.name).toBe('New');
      expect(result.message).toBe('Cập nhật nhà cung cấp thành công');
    });

    it('ném lỗi khi email bị trùng khi update', async () => {
      const supplier = { supplier_id: 1, name: 'Old' };
      mockPrisma.supplier.findUnique.mockResolvedValue(supplier);

      mockPrisma.supplier.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '1',
          meta: { target: ['email'] },
        }),
      );

      await expect(
        service.update(1, { email: 'duplicate@test.com' }),
      ).rejects.toThrow('Email nhà cung cấp đã tồn tại');
    });

    it('ném lỗi nếu nhà cung cấp không tồn tại', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { name: 'New' })).rejects.toThrow('Nhà cung cấp không tồn tại');
    });
  });

  describe('remove', () => {
    it('ném lỗi nếu nhà cung cấp không tồn tại', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow('Nhà cung cấp không tồn tại');
    });

    it('ném lỗi nếu nhà cung cấp đã từng nhập hàng', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue({
        supplier_id: 1,
        _count: { supplies: 2 },
      });

      await expect(service.remove(1)).rejects.toThrow('Không thể xoá nhà cung cấp đã từng nhập hàng');
    });

    it('xóa thành công nếu chưa từng nhập hàng', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue({
        supplier_id: 1,
        _count: { supplies: 0 },
      });

      mockPrisma.supplier.delete.mockResolvedValue({
        supplier_id: 1,
      });

      const result = await service.remove(1);

      expect(result.message).toBe('Xóa nhà cung cấp thành công');
      expect(result.supplier.supplier_id).toBe(1);
    });
  });
});