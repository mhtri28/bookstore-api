import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, Prisma } from '../../generated/prisma/client';
import { QueryCategoryDto } from './dto/query-category.dto';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async category(categoryWhereUniqueInput: Prisma.CategoryWhereUniqueInput): Promise<Category | null> {
    try {
      return this.prismaService.category.findUnique({
        where: categoryWhereUniqueInput,
      });
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy thông tin danh mục thất bại',
      });
    }
  }

  async categories(query: QueryCategoryDto): Promise<Category[]> {
    try {
      const orderBy: Prisma.CategoryOrderByWithRelationInput = query.orderBy
        ? { [query.orderBy]: query.sortOrder || 'desc' }
        : { created_at: 'desc' };

      return this.prismaService.category.findMany({
        skip: query.skip,
        take: query.take,
        where: this.buildWhere(query),
        orderBy,
      });
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy danh sách danh mục thất bại',
      });
    }
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    try {
      return this.prismaService.category.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, {
        uniqueMessage: 'Danh mục đã tồn tại',
        defaultMessage: 'Tạo danh mục thất bại',
      });
    }
  }

  async updateCategory(params: {
    where: Prisma.CategoryWhereUniqueInput;
    data: Prisma.CategoryUpdateInput;
  }): Promise<Category> {
    try {
      const { where, data } = params;
      return this.prismaService.category.update({
        data,
        where,
      });
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Danh mục không tồn tại',
        uniqueMessage: 'Danh mục đã tồn tại',
        defaultMessage: 'Cập nhật danh mục thất bại',
      });
    }
  }

  async deleteCategory(where: Prisma.CategoryWhereUniqueInput): Promise<Category> {
    try {
      return this.prismaService.category.delete({
        where,
      });
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Danh mục không tồn tại',
        defaultMessage: 'Xóa danh mục thất bại',
      });
    }
  }

  private buildWhere(query: QueryCategoryDto): Prisma.CategoryWhereInput | undefined {
    const where: Prisma.CategoryWhereInput = {};

    if (query.name) {
      where.name = {
        contains: query.name,
      };
    }

    if (query.description) {
      where.description = {
        contains: query.description,
      };
    }

    return Object.keys(where).length ? where : undefined;
  }
}
