import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { Role, UserStatus } from 'src/generated/prisma/enums';
import { UnauthorizedException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    user_id: 1,
    fullname: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockHashingService = {
    compare: jest.fn(),
    hash: jest.fn(),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: HashingService, useValue: mockHashingService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('service phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('lấy thông tin user thành công', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result.message).toBe('Lấy thông tin người dùng thành công');
      expect(result.user.user_id).toBe(1);
    });

    it('ném lỗi khi user không tồn tại', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow('Không tìm thấy người dùng');
    });
  });

  describe('updateProfile', () => {
    it('cập nhật profile thành công', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, fullname: 'New Name' });

      const result = await service.updateProfile(1, { fullname: 'New Name', email: 'test@example.com' });
      expect(result.message).toBe('Cập nhật thông tin người dùng thành công');
      expect(result.user.fullname).toBe('New Name');
    });
  });

  describe('changePassword', () => {
    it('đổi mật khẩu thành công', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockHashingService.compare.mockResolvedValue(true);
      mockHashingService.hash.mockResolvedValue('newhashedpassword');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.changePassword(1, {
        currentPassword: 'oldpassword',
        newPassword: 'NewPassword1!',
        confirmNewPassword: 'NewPassword1!',
      });

      expect(result.message).toBe('Đổi mật khẩu thành công');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('ném lỗi khi mật khẩu cũ sai', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockHashingService.compare.mockResolvedValue(false);

      await expect(
        service.changePassword(1, {
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword1!',
          confirmNewPassword: 'NewPassword1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});