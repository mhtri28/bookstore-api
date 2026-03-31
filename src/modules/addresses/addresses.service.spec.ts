import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { prismaNotFoundError } from 'src/test/utils/prisma-test-errors';

describe('AddressesService', () => {
  let service: AddressesService;

  const user_id = 1;

  const addressData = {
    name: 'John Doe',
    phone: '1234567890',
    shippingAddress: '123 Main St',
    isDefault: true,
  };

  const dbAddress = {
    name: addressData.name,
    phone: addressData.phone,
    shipping_address: addressData.shippingAddress,
    isDefault: addressData.isDefault,
    user_id: user_id,
    address_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
    address: {
      count: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);

    mockPrismaService.$transaction.mockImplementation((cb: any) => {
      return cb({ address: mockPrismaService.address });
    });

    jest.clearAllMocks();
  });

  it('phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('tạo địa chỉ thành công và tự đặt mặc định nếu là địa chỉ đầu tiên', async () => {
      mockPrismaService.address.count.mockResolvedValue(0);
      mockPrismaService.address.updateMany.mockResolvedValue({});
      mockPrismaService.address.create.mockResolvedValue(dbAddress);

      const result = await service.create(user_id, addressData);

      expect(mockPrismaService.address.count).toHaveBeenCalledWith({
        where: { user_id },
      });
      expect(mockPrismaService.address.updateMany).toHaveBeenCalledWith({
        where: {
          user_id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
      expect(mockPrismaService.address.create).toHaveBeenCalledWith({
        data: {
          user_id,
          name: addressData.name,
          phone: addressData.phone,
          shipping_address: addressData.shippingAddress,
          isDefault: true,
        },
      });
      expect(result).toEqual({ message: 'Tạo địa chỉ thành công', address: dbAddress });
    });

    it('ném lỗi khi người dùng đã có 5 địa chỉ', async () => {
      mockPrismaService.address.count.mockResolvedValue(5);
      await expect(service.create(user_id, addressData)).rejects.toThrow(
        'Mỗi người dùng chỉ được tạo tối đa 5 địa chỉ',
      );
    });
  });

  describe('findAll', () => {
    it('trả về danh sách địa chỉ của người dùng', async () => {
      mockPrismaService.address.findMany.mockResolvedValue([dbAddress]);
      const result = await service.findAll(user_id);
      expect(result).toEqual({
        message: 'Lấy danh sách địa chỉ thành công',
        addresses: [dbAddress],
      });
    });
  });

  describe('findOne', () => {
    it('trả về một địa chỉ theo id', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockResolvedValue(dbAddress);
      const result = await service.findOne(user_id, dbAddress.address_id);
      expect(result.address).toEqual(dbAddress);
      expect(result.message).toBe('Lấy địa chỉ thành công');
    });

    it('ném lỗi khi địa chỉ không tồn tại', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.findOne(user_id, dbAddress.address_id)).rejects.toThrow('Địa chỉ không tồn tại');
    });
  });

  describe('setDefault', () => {
    it('đặt địa chỉ mặc định thành công', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockResolvedValue(dbAddress);
      mockPrismaService.address.updateMany.mockResolvedValue({});
      mockPrismaService.address.update.mockResolvedValue({
        ...dbAddress,
        isDefault: true,
      });

      const result = await service.setDefault(user_id, dbAddress.address_id);
      expect(mockPrismaService.address.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          address_id: dbAddress.address_id,
          user_id,
        },
      });
      expect(mockPrismaService.address.updateMany).toHaveBeenCalledWith({
        where: {
          user_id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
      expect(mockPrismaService.address.update).toHaveBeenCalledWith({
        where: {
          address_id: dbAddress.address_id,
          user_id,
        },
        data: {
          isDefault: true,
        },
      });
      expect(result.message).toEqual('Đặt địa chỉ mặc định thành công');
    });

    it('ném lỗi khi địa chỉ không tồn tại', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.setDefault(user_id, dbAddress.address_id)).rejects.toThrow('Địa chỉ không tồn tại');
    });
  });

  describe('update', () => {
    it('cập nhật địa chỉ thành công', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockResolvedValue({ ...dbAddress, isDefault: false });
      mockPrismaService.address.updateMany.mockResolvedValue({});
      mockPrismaService.address.update.mockResolvedValue(dbAddress);

      const result = await service.update(user_id, dbAddress.address_id, { ...addressData, isDefault: true });

      expect(mockPrismaService.address.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          address_id: dbAddress.address_id,
          user_id,
        },
      });
      expect(mockPrismaService.address.updateMany).toHaveBeenCalledWith({
        where: {
          user_id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
      expect(mockPrismaService.address.update).toHaveBeenCalledWith({
        where: {
          address_id: dbAddress.address_id,
          user_id,
        },
        data: {
          name: addressData.name,
          phone: addressData.phone,
          shipping_address: addressData.shippingAddress,
          isDefault: addressData.isDefault,
        },
      });
      expect(result).toEqual({
        message: 'Cập nhật địa chỉ thành công',
        address: dbAddress,
      });
    });

    it('ném lỗi khi bỏ trạng thái mặc định của địa chỉ đang mặc định', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockResolvedValue({ ...dbAddress, isDefault: true });
      await expect(service.update(user_id, dbAddress.address_id, { ...addressData, isDefault: false })).rejects.toThrow(
        'Không thể bỏ trạng thái mặc định của địa chỉ này',
      );
    });

    it('ném lỗi khi địa chỉ không tồn tại', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.update(user_id, dbAddress.address_id, addressData)).rejects.toThrow('Địa chỉ không tồn tại');
    });
  });

  describe('remove', () => {
    it('xóa địa chỉ thành công', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockResolvedValue({ ...dbAddress, isDefault: false });
      mockPrismaService.address.delete.mockResolvedValue(dbAddress);

      const result = await service.remove(user_id, dbAddress.address_id);

      expect(mockPrismaService.address.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          address_id: dbAddress.address_id,
          user_id,
        },
      });
      expect(mockPrismaService.address.delete).toHaveBeenCalledWith({
        where: {
          address_id: dbAddress.address_id,
          user_id,
        },
      });
      expect(result).toEqual({
        message: 'Xóa địa chỉ thành công',
      });
    });

    it('ném lỗi khi xóa địa chỉ mặc định', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockResolvedValue({ ...dbAddress, isDefault: true });
      await expect(service.remove(user_id, dbAddress.address_id)).rejects.toThrow('Không thể xóa địa chỉ mặc định');
    });

    it('ném lỗi khi địa chỉ không tồn tại', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.remove(user_id, dbAddress.address_id)).rejects.toThrow('Địa chỉ không tồn tại');
    });
  });
});
