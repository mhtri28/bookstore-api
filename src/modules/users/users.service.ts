import { Injectable, NotFoundException, Patch, UnauthorizedException } from '@nestjs/common';
import { UpdateUserBodyDTO, UpdateUserRoleBodyDTO, UpdateUserStatusBodyDTO } from './dto/update-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserModel } from 'src/shared/models/user.model';
import { isNotFoundPrismaError } from 'src/shared/helpers/prisma-error.helper';
import { ChangePasswordBodyDTO } from 'src/modules/users/dto/change-password.dto';
import { HashingService } from 'src/shared/services/hashing.service';
import { GetUsersQueryDTO } from 'src/modules/users/dto/get-users-query.dto';
import { paginate, paginatedResponse } from 'src/shared/helpers/pagination.helper';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async findAll(query: GetUsersQueryDTO) {
    const { search, status, role, page = 1, limit = 10 } = query;

    const where: any = {};

    if (search) {
      where.OR = [{ email: { contains: search } }, { fullname: { contains: search } }];
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

    return {
      message: 'Lấy danh sách người dùng thành công',
      ...paginatedResponse(
        users.map((user) => new UserModel(user)),
        total,
        page,
        limit,
      ),
    };
  }

  async findOne(id: number) {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: { user_id: id },
      });
      return { message: 'Lấy thông tin người dùng thành công', user: new UserModel(user) };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      throw error;
    }
  }

  async updateProfile(id: number, body: UpdateUserBodyDTO) {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: { user_id: id },
        data: {
          fullname: body.fullname,
          email: body.email,
        },
      });
      return { message: 'Cập nhật thông tin người dùng thành công', user: new UserModel(updatedUser) };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      throw error;
    }
  }

  async updateStatus(userId: number, id: number, body: UpdateUserStatusBodyDTO) {
    try {
      if (userId === id) {
        throw new UnauthorizedException('Không thể thay đổi trạng thái của chính mình');
      }

      const updatedUser = await this.prismaService.user.update({
        where: { user_id: id },
        data: {
          status: body.status,
        },
      });
      return { message: 'Cập nhật trạng thái người dùng thành công', user: new UserModel(updatedUser) };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      throw error;
    }
  }

  async changePassword(userId: number, body: ChangePasswordBodyDTO) {
    try {
      // 1. Tìm thông tin user hiện tại
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: { user_id: userId },
      });

      // 2. Kiểm tra mật khẩu hiện tại có đúng không
      const isCurrentPasswordMatch = await this.hashingService.compare(body.currentPassword, user.password);
      if (!isCurrentPasswordMatch) {
        throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
      }

      // 3. Hash mật khẩu mới
      const hashedNewPassword = await this.hashingService.hash(body.newPassword);

      // 4. Cập nhật mật khẩu mới
      await this.prismaService.user.update({
        where: { user_id: userId },
        data: {
          password: hashedNewPassword,
        },
      });

      return { message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      throw error;
    }
  }

  @Patch(':id/role')
  async updateRole(userId: number, id: number, body: UpdateUserRoleBodyDTO) {
    try {
      if (userId === id) {
        throw new UnauthorizedException('Không thể thay đổi vai trò của chính mình');
      }

      const updatedUser = await this.prismaService.user.update({
        where: { user_id: id },
        data: {
          role: body.role,
        },
      });
      return { message: 'Cập nhật vai trò người dùng thành công', user: new UserModel(updatedUser) };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      throw error;
    }
  }
}
