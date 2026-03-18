import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Author, Prisma } from '../../generated/prisma/client';
import { QueryAuthorDto } from './dto/query-author.dto';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';

@Injectable()
export class AuthorsService {
  constructor(private readonly prismaService: PrismaService) {}

  async author(authorWhereUniqueInput: Prisma.AuthorWhereUniqueInput): Promise<Author | null> {
    try {
      return this.prismaService.author.findUnique({
        where: authorWhereUniqueInput,
      });
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy thông tin tác giả thất bại',
      });
    }
  }

  async authors(query: QueryAuthorDto): Promise<Author[]> {
    try {
      const where: Prisma.AuthorWhereInput | undefined = query.name
        ? {
            name: {
              contains: query.name,
            },
          }
        : undefined;

      const orderBy: Prisma.AuthorOrderByWithRelationInput = query.orderBy
        ? { [query.orderBy]: query.sortOrder || 'desc' }
        : { created_at: 'desc' };

      return this.prismaService.author.findMany({
        skip: query.skip,
        take: query.take,
        where,
        orderBy,
      });
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy danh sách tác giả thất bại',
      });
    }
  }

  async create(data: Prisma.AuthorCreateInput): Promise<Author> {
    try {
      return this.prismaService.author.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, {
        uniqueMessage: 'Tác giả đã tồn tại',
        defaultMessage: 'Tạo tác giả thất bại',
      });
    }
  }

  async updateAuthor(params: {
    where: Prisma.AuthorWhereUniqueInput;
    data: Prisma.AuthorUpdateInput;
  }): Promise<Author> {
    try {
      const { where, data } = params;
      return this.prismaService.author.update({
        data,
        where,
      });
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Tác giả không tồn tại',
        uniqueMessage: 'Tác giả đã tồn tại',
        defaultMessage: 'Cập nhật tác giả thất bại',
      });
    }
  }

  async deleteAuthor(where: Prisma.AuthorWhereUniqueInput): Promise<Author> {
    try {
      return this.prismaService.author.delete({
        where,
      });
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Tác giả không tồn tại',
        defaultMessage: 'Xóa tác giả thất bại',
      });
    }
  }
}
