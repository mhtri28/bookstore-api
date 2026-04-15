import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { UserStatus } from 'src/generated/prisma/browser';
import { Role } from 'src/generated/prisma/client';
import { prismaNotFoundError, prismaUniqueError } from 'src/test/utils/prisma-test-errors';

describe('AuthService', () => {
  let service: AuthService;

  const userData = {
    email: 'test@gmail.com',
    password: '1234567',
    confirmPassword: '1234567',
    fullname: 'Test User',
  };

  const hashedPassword = 'hashedPassword';

  const dbUser = {
    user_id: 1,
    email: userData.email,
    fullname: userData.fullname,
    password: hashedPassword,
    role: Role.USER,
    status: UserStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const dbRefreshToken = {
    user_id: 1,
    token: 'refreshToken',
    expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    created_at: new Date(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn().mockResolvedValue(userData),
      findUniqueOrThrow: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirstOrThrow: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockTokenService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('đăng ký thành công', async () => {
      const createdUser = {
        user_id: 1,
        email: userData.email,
        fullname: userData.fullname,
        password: hashedPassword,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockHashingService.hash.mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.register(userData);

      expect(mockHashingService.hash).toHaveBeenCalledTimes(1);
      expect(mockHashingService.hash).toHaveBeenCalledWith(userData.password);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          fullname: userData.fullname,
          password: hashedPassword,
        },
      });
      expect(result).toEqual({
        message: 'Đăng ký thành công',
        user: createdUser,
      });
    });

    it('ném lỗi khi đăng ký thất bại', async () => {
      mockHashingService.hash.mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockRejectedValue(prismaUniqueError());

      await expect(service.register(userData)).rejects.toThrow('Email đã tồn tại');
    });
  });

  describe('generateTokens', () => {
    it('tạo token thành công', async () => {
      const tokenPayload = {
        userId: 1,
        role: Role.USER,
      };

      const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour

      mockTokenService.signAccessToken.mockResolvedValue('accessToken');
      mockTokenService.signRefreshToken.mockResolvedValue('refreshToken');
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        userId: tokenPayload.userId,
        role: tokenPayload.role,
        exp,
        iat: exp - 60 * 60, // 1 hour ago
      });

      const result = await service.generateTokens(tokenPayload);
      expect(mockTokenService.signAccessToken).toHaveBeenCalledWith(tokenPayload);
      expect(mockTokenService.signRefreshToken).toHaveBeenCalledWith(tokenPayload);
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('refreshToken');
      expect(mockPrismaService.refreshToken.create).toHaveBeenCalledWith({
        data: {
          token: 'refreshToken',
          expires_at: new Date(exp * 1000),
          user_id: tokenPayload.userId,
        },
      });
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });

  describe('login', () => {
    it('đăng nhập thành công', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(dbUser);
      mockHashingService.compare.mockResolvedValue(true);
      const generateTokensSpy = jest.spyOn(service, 'generateTokens').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const result = await service.login({
        email: userData.email,
        password: userData.password,
      });

      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          email: userData.email,
        },
      });
      expect(mockHashingService.compare).toHaveBeenCalledWith(userData.password, dbUser.password);
      expect(generateTokensSpy).toHaveBeenCalledWith({
        userId: dbUser.user_id,
        role: Role.USER,
      });
      expect(result).toEqual({
        message: 'Đăng nhập thành công',
        tokens: {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        },
        user: dbUser,
      });
    });

    it('ném lỗi khi tài khoản không tồn tại', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(
        service.login({
          email: userData.email,
          password: userData.password,
        }),
      ).rejects.toThrow('Email hoặc mật khẩu không đúng');
    });

    it('ném lỗi khi tài khoản chưa kích hoạt', async () => {
      const inactiveUser = { ...dbUser, status: UserStatus.INACTIVE };
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(inactiveUser);
      await expect(
        service.login({
          email: userData.email,
          password: userData.password,
        }),
      ).rejects.toThrow('Tài khoản bị khóa hoặc chưa được kích hoạt');
    });

    it('ném lỗi khi mật khẩu không đúng', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(dbUser);
      mockHashingService.compare.mockResolvedValue(false);
      await expect(
        service.login({
          email: userData.email,
          password: userData.password,
        }),
      ).rejects.toThrow('Email hoặc mật khẩu không đúng');
    });
  });

  describe('refreshToken', () => {
    it('làm mới token thành công', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        userId: dbUser.user_id,
        role: dbUser.role,
      });
      mockPrismaService.refreshToken.findFirstOrThrow.mockResolvedValue(dbRefreshToken);
      mockPrismaService.refreshToken.delete.mockResolvedValue(dbRefreshToken);
      const generateTokensSpy = jest.spyOn(service, 'generateTokens').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const result = await service.refreshToken('refreshToken');
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('refreshToken');
      expect(generateTokensSpy).toHaveBeenCalledWith({
        userId: dbUser.user_id,
        role: dbUser.role,
      });
      expect(mockPrismaService.refreshToken.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          token: 'refreshToken',
          user_id: dbUser.user_id,
        },
      });
      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: {
          token: 'refreshToken',
          user_id: dbUser.user_id,
        },
      });
      expect(result.message).toEqual('Làm mới token thành công');
      expect(result.tokens).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('ném lỗi khi refresh token không hợp lệ', async () => {
      mockTokenService.verifyRefreshToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken('invalidToken')).rejects.toThrow('Làm mới token thất bại');
    });

    it('ném lỗi khi refresh token không tồn tại trong DB', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        userId: dbUser.user_id,
        role: dbUser.role,
      });
      mockPrismaService.refreshToken.findFirstOrThrow.mockRejectedValue(prismaNotFoundError());
      await expect(service.refreshToken('refreshToken')).rejects.toThrow(
        'Refresh token không hợp lệ hoặc đã bị sử dụng',
      );
    });
  });

  describe('logout', () => {
    it('đăng xuất thành công', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        userId: dbUser.user_id,
        role: dbUser.role,
      });
      mockPrismaService.refreshToken.delete.mockResolvedValue(dbRefreshToken);

      const result = await service.logout('refreshToken');
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('refreshToken');
      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: {
          token: 'refreshToken',
          user_id: dbUser.user_id,
        },
      });
      expect(result.message).toEqual('Đăng xuất thành công');
    });

    it('ném lỗi khi refresh token không hợp lệ', async () => {
      mockTokenService.verifyRefreshToken.mockRejectedValue(new Error('Invalid token'));
      await expect(service.logout('invalidToken')).rejects.toThrow('Đăng xuất thất bại');
    });

    it('ném lỗi khi refresh token không tồn tại trong DB', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        userId: dbUser.user_id,
        role: dbUser.role,
      });
      mockPrismaService.refreshToken.delete.mockRejectedValue(prismaNotFoundError());
      await expect(service.logout('refreshToken')).rejects.toThrow('Refresh token không hợp lệ hoặc đã bị sử dụng');
    });
  });
});
