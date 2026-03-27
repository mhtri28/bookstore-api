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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it("should create successfully and set isDefault to true if it's the first address", async () => {
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
      expect(result).toEqual({
        message: 'Tạo địa chỉ thành công',
        result: dbAddress,
      });
    });

    it('should create fail if user already has 5 addresses', async () => {
      mockPrismaService.address.count.mockResolvedValue(5);
      await expect(service.create(user_id, addressData)).rejects.toThrow(
        'Mỗi người dùng chỉ được tạo tối đa 5 địa chỉ',
      );
    });
  });

  describe('findAll', () => {
    it('should find all addresses for a user', async () => {
      mockPrismaService.address.findMany.mockResolvedValue([dbAddress]);
      const result = await service.findAll(user_id);
      expect(result).toEqual({
        message: 'Lấy danh sách địa chỉ thành công',
        addresses: [dbAddress],
      });
    });
  });

  describe('findOne', () => {
    it('should find one address by id', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockResolvedValue(dbAddress);
      const result = await service.findOne(user_id, dbAddress.address_id);
      expect(result.address).toEqual(dbAddress);
      expect(result.message).toBe('Lấy địa chỉ thành công');
    });

    it('should find one address by id fail if address does not exist', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.findOne(user_id, dbAddress.address_id)).rejects.toThrow('Địa chỉ không tồn tại');
    });
  });

  describe('setDefault', () => {
    it('should set default address successfully', async () => {
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

    it('should set default address fail if address does not exist', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.setDefault(user_id, dbAddress.address_id)).rejects.toThrow('Địa chỉ không tồn tại');
    });
  });

  describe('update', () => {
    it('should update address successfully', async () => {
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

    it("should update address fail if trying to set isDefault to true when it's already default", async () => {
      mockPrismaService.address.findUniqueOrThrow.mockResolvedValue({ ...dbAddress, isDefault: true });
      await expect(service.update(user_id, dbAddress.address_id, { ...addressData, isDefault: false })).rejects.toThrow(
        'Không thể bỏ trạng thái mặc định của địa chỉ này',
      );
    });

    it('should update address fail if address does not exist', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.update(user_id, dbAddress.address_id, addressData)).rejects.toThrow('Địa chỉ không tồn tại');
    });
  });

  describe('remove', () => {
    it('should remove address successfully', async () => {
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

    it('should remove address fail if trying to remove default address', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockResolvedValue({ ...dbAddress, isDefault: true });
      await expect(service.remove(user_id, dbAddress.address_id)).rejects.toThrow('Không thể xóa địa chỉ mặc định');
    });

    it('should remove address fail if address does not exist', async () => {
      mockPrismaService.address.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.remove(user_id, dbAddress.address_id)).rejects.toThrow('Địa chỉ không tồn tại');
    });
  });
});
