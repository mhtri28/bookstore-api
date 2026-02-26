import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, Prisma } from '../../generated/prisma/client';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}
  async category(categoryWhereUniqueInput: Prisma.CategoryWhereUniqueInput): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: categoryWhereUniqueInput,
    });
  }

  async categories(query: QueryCategoryDto): Promise<Category[]> {
    const orderBy: Prisma.CategoryOrderByWithRelationInput = query.orderBy
      ? { [query.orderBy]: query.sortOrder || 'desc' }
      : { created_at: 'desc' };

    return this.prisma.category.findMany({
      skip: query.skip,
      take: query.take,
      where: this.buildWhere(query),
      orderBy,
    });
  }
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({
      data,
    });
  }

  async updateCategory(params: {
    where: Prisma.CategoryWhereUniqueInput;
    data: Prisma.CategoryUpdateInput;
  }): Promise<Category> {
    const { where, data } = params;
    return this.prisma.category.update({
      data,
      where,
    });
  }

  async deleteCategory(where: Prisma.CategoryWhereUniqueInput): Promise<Category> {
    return this.prisma.category.delete({
      where,
    });
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
