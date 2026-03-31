import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  UpdateUserBodyDTO,
  UpdateUserRoleBodyDTO,
  UpdateUserStatusBodyDTO,
} from './dto/update-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';
import { ChangePasswordBodyDTO } from './dto/change-password.dto';
import { HashingService } from 'src/shared/services/hashing.service';
import { GetUsersQueryDTO } from './dto/get-users-query.dto';
import { paginate, paginatedResponse } from 'src/shared/helpers/pagination.helper';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  private mapUser(user: any) {
    return {
      user_id: user.user_id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async findAll(query: GetUsersQueryDTO) {
    try {
      const { search, status, role, page = 1, limit = 10 } = query;

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search } },
          { fullname: { contains: search } },
        ];
      }
      if (status) where.status = status;
      if (role) where.role = role;

      const [users, total] = await Promise.all([
        this.prismaService.user.findMany({
          where,
          ...paginate(page, limit),
          orderBy: { created_at: 'desc' },
        }),
        this.prismaService.user.count({ where }),
      ]);

      const paginatedData = paginatedResponse(
        users.map((user) => this.mapUser(user)),
        total,
        page,
        limit,
      );

      return {
        message: 'Lấy danh sách người dùng thành công',
        data: paginatedData.data,
        meta: paginatedData.meta,
      };
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy danh sách người dùng thất bại',
      });
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { user_id: id },
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      return {
        message: 'Lấy thông tin người dùng thành công',
        user: this.mapUser(user),
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Không tìm thấy người dùng',
        defaultMessage: 'Lấy thông tin người dùng thất bại',
      });
    }
  }

  async updateProfile(id: number, body: UpdateUserBodyDTO) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { user_id: id },
      });

      if (!existingUser) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      const updatedUser = await this.prismaService.user.update({
        where: { user_id: id },
        data: {
          fullname: body.fullname,
          email: body.email,
        },
      });

      return {
        message: 'Cập nhật thông tin người dùng thành công',
        user: this.mapUser(updatedUser),
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Email đã được sử dụng');
      }
      handlePrismaError(error, {
        notFoundMessage: 'Không tìm thấy người dùng',
        defaultMessage: 'Cập nhật thông tin người dùng thất bại',
      });
    }
  }

  async updateStatus(id: number, body: UpdateUserStatusBodyDTO) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { user_id: id },
      });

      if (!existingUser) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      const updatedUser = await this.prismaService.user.update({
        where: { user_id: id },
        data: {
          status: body.status,
        },
      });

      return {
        message: 'Cập nhật trạng thái người dùng thành công',
        user: this.mapUser(updatedUser),
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Không tìm thấy người dùng',
        defaultMessage: 'Cập nhật trạng thái người dùng thất bại',
      });
    }
  }

  async changePassword(userId: number, body: ChangePasswordBodyDTO) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      const isCurrentPasswordMatch = await this.hashingService.compare(
        body.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordMatch) {
        throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
      }

      const hashedNewPassword = await this.hashingService.hash(body.newPassword);

      await this.prismaService.user.update({
        where: { user_id: userId },
        data: {
          password: hashedNewPassword,
        },
      });

      return { message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Không tìm thấy người dùng',
        defaultMessage: 'Đổi mật khẩu thất bại',
      });
    }
  }

  async updateRole(id: number, body: UpdateUserRoleBodyDTO) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { user_id: id },
      });

      if (!existingUser) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      const updatedUser = await this.prismaService.user.update({
        where: { user_id: id },
        data: {
          role: body.role,
        },
      });

      return {
        message: 'Cập nhật vai trò người dùng thành công',
        user: this.mapUser(updatedUser),
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Không tìm thấy người dùng',
        defaultMessage: 'Cập nhật vai trò người dùng thất bại',
      });
    }
  }
}