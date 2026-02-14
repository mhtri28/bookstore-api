import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from './prisma-error.helper';

interface ErrorConfig {
  notFoundMessage?: string;
  uniqueMessage?: string;
  foreignKeyMessage?: string;
  defaultMessage: string;
}

/**
 * Xử lý lỗi Prisma và throw HttpException tương ứng
 * @param error - Error object từ try-catch
 * @param config - Cấu hình message cho từng loại lỗi
 */
export function handlePrismaError(error: any, config: ErrorConfig): never {
  // 1. Nếu đã là HttpException rồi thì throw luôn
  if (error instanceof HttpException) {
    throw error;
  }

  // 2. Not Found Error (P2025)
  if (isNotFoundPrismaError(error)) {
    throw new NotFoundException(config.notFoundMessage || 'Không tìm thấy dữ liệu');
  }

  // 3. Unique Constraint Error (P2002)
  if (isUniqueConstraintPrismaError(error)) {
    throw new ConflictException(config.uniqueMessage || 'Dữ liệu đã tồn tại');
  }

  // 4. Foreign Key Constraint Error (P2003)
  if (isForeignKeyConstraintPrismaError(error)) {
    throw new BadRequestException(config.foreignKeyMessage || 'Dữ liệu tham chiếu không hợp lệ');
  }

  // 5. Lỗi khác
  throw new InternalServerErrorException(config.defaultMessage);
}
