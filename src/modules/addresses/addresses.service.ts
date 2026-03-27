import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressBodyDTO } from './dto/create-address.dto';
import { UpdateAddressBodyDTO } from './dto/update-address.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';

@Injectable()
export class AddressesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: number, body: CreateAddressBodyDTO) {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        // 1. Điếm số lượng address hiện có
        const addressCount = await tx.address.count({
          where: {
            user_id: userId,
          },
        });

        let isDefault = body.isDefault;

        // 2. Nếu chưa có thì set isDefault = true
        if (addressCount === 0) {
          isDefault = true;
        }

        if (addressCount >= 5) {
          throw new BadRequestException('Mỗi người dùng chỉ được tạo tối đa 5 địa chỉ');
        }

        // 3. Nếu isDefault = true thì set isDefault = false cho các address khác
        if (isDefault) {
          await tx.address.updateMany({
            where: {
              user_id: userId,
              isDefault: true,
            },
            data: {
              isDefault: false,
            },
          });
        }

        // 4. Tạo address mới
        const address = await tx.address.create({
          data: {
            user_id: userId,
            name: body.name,
            phone: body.phone,
            shipping_address: body.shippingAddress,
            isDefault,
          },
        });

        return address;
      });

      return {
        message: 'Tạo địa chỉ thành công',
        result,
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Địa chỉ không tồn tại',
        defaultMessage: 'Tạo địa chỉ thất bại',
      });
    }
  }

  async findAll(userId: number) {
    const addresses = await this.prismaService.address.findMany({
      where: {
        user_id: userId,
      },
    });
    return { message: 'Lấy danh sách địa chỉ thành công', addresses };
  }

  async findOne(userId: number, addressId: number) {
    try {
      const address = await this.prismaService.address.findUniqueOrThrow({
        where: {
          address_id: addressId,
          user_id: userId,
        },
      });
      return { message: 'Lấy địa chỉ thành công', address };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Địa chỉ không tồn tại',
        defaultMessage: 'Lấy địa chỉ thất bại',
      });
    }
  }

  async setDefault(userId: number, addressId: number) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        // 1. Kiểm tra address tồn tại
        await tx.address.findUniqueOrThrow({
          where: {
            address_id: addressId,
            user_id: userId,
          },
        });

        // 2. Set isDefault = false cho các address khác
        await tx.address.updateMany({
          where: {
            user_id: userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });

        // 3. Set isDefault = true cho address được chọn
        await tx.address.update({
          where: {
            address_id: addressId,
            user_id: userId,
          },
          data: {
            isDefault: true,
          },
        });
      });

      return {
        message: 'Đặt địa chỉ mặc định thành công',
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Địa chỉ không tồn tại',
        defaultMessage: 'Đặt địa chỉ mặc định thất bại',
      });
    }
  }

  async update(userId: number, addressId: number, body: UpdateAddressBodyDTO) {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        // 1. Kiểm tra address tồn tại
        const currentAddress = await tx.address.findUniqueOrThrow({
          where: {
            address_id: addressId,
            user_id: userId,
          },
        });

        // 2. Nếu đang là default mà muốn bỏ default
        if (currentAddress.isDefault && body.isDefault === false) {
          throw new BadRequestException('Không thể bỏ trạng thái mặc định của địa chỉ này');
        }

        // 3. Nếu đang false thì thành true
        if (body.isDefault && !currentAddress.isDefault) {
          await tx.address.updateMany({
            where: {
              user_id: userId,
              isDefault: true,
            },
            data: {
              isDefault: false,
            },
          });
        }

        // 4. Cập nhật địa chỉ
        const updatedAddress = await tx.address.update({
          where: {
            address_id: addressId,
            user_id: userId,
          },
          data: {
            name: body.name,
            phone: body.phone,
            shipping_address: body.shippingAddress,
            isDefault: body.isDefault,
          },
        });

        return updatedAddress;
      });

      return {
        message: 'Cập nhật địa chỉ thành công',
        address: result,
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Địa chỉ không tồn tại',
        defaultMessage: 'Cập nhật địa chỉ thất bại',
      });
    }
  }

  async remove(userId: number, addressId: number) {
    try {
      const currentAddress = await this.prismaService.address.findUniqueOrThrow({
        where: {
          address_id: addressId,
          user_id: userId,
        },
      });

      if (currentAddress.isDefault) {
        throw new BadRequestException('Không thể xóa địa chỉ mặc định');
      }

      await this.prismaService.address.delete({
        where: {
          address_id: addressId,
          user_id: userId,
        },
      });

      return { message: 'Xóa địa chỉ thành công' };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Địa chỉ không tồn tại',
        defaultMessage: 'Xóa địa chỉ thất bại',
      });
    }
  }
}
