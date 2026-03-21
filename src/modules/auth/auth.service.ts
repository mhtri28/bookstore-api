import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from 'src/generated/prisma/browser';
import { LoginBodyDTO } from 'src/modules/auth/dto/login.dto';
import { RegisterBodyDTO } from 'src/modules/auth/dto/register.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';
import { UserModel } from 'src/shared/models/user.model';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  async register(body: RegisterBodyDTO) {
    try {
      const hashedPassword = await this.hashingService.hash(body.password);
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          fullname: body.fullname,
          password: hashedPassword,
        },
      });
      return {
        message: 'Đăng ký thành công',
        user: new UserModel(user),
      };
    } catch (error) {
      handlePrismaError(error, {
        uniqueMessage: 'Email đã tồn tại',
        defaultMessage: 'Đăng ký thất bại',
      });
    }
  }

  async generateTokens(payload: { userId: number; role: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        expires_at: new Date(decodedRefreshToken.exp * 1000),
        user_id: payload.userId,
      },
    });

    return { accessToken, refreshToken };
  }

  async login(body: LoginBodyDTO) {
    try {
      // 1. Tìm kiếm thông tin người dùng theo email
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: {
          email: body.email,
        },
      });

      // 2. Kiểm tra trạng thái tài khoản
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Tài khoản bị khóa hoặc chưa được kích hoạt');
      }

      // 3. So sánh mật khẩu
      const isPasswordMatch = await this.hashingService.compare(body.password, user.password);
      if (!isPasswordMatch) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      // 4. Tạo tokens
      const tokens = await this.generateTokens({ userId: user.user_id, role: user.role });

      return {
        message: 'Đăng nhập thành công',
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        user: new UserModel(user),
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Email hoặc mật khẩu không đúng',
        defaultMessage: 'Đăng nhập thất bại',
      });
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1. Kiểm tra token có hợp lệ hay không
      const { userId, role } = await this.tokenService.verifyRefreshToken(refreshToken);

      // 2. Kiểm tra token có tồn tại trong database hay không
      await this.prismaService.refreshToken.findFirstOrThrow({
        where: {
          token: refreshToken,
          user_id: userId,
        },
      });

      // 3. Xóa refresh token cũ
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
          user_id: userId,
        },
      });

      // 4. Tạo mới access token và refresh token
      const tokens = await this.generateTokens({ userId, role });
      return { message: 'Làm mới token thành công', tokens };
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      handlePrismaError(error, {
        notFoundMessage: 'Refresh token không hợp lệ hoặc đã bị sử dụng',
        defaultMessage: 'Làm mới token thất bại',
      });
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ hay không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);

      // 2. Xóa refreshToken khỏi database
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
          user_id: userId,
        },
      });
      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      handlePrismaError(error, {
        notFoundMessage: 'Refresh token không hợp lệ hoặc đã bị sử dụng',
        defaultMessage: 'Đăng xuất thất bại',
      });
    }
  }
}
