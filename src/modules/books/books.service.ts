import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { handlePrismaError } from 'src/shared/helpers/handle-prisma-error.helper';

@Injectable()
export class BooksService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateBookDto, file?: Express.Multer.File) {
    try {
      let image_url: string | null = null;

      if (file) {
        image_url = `/images/${file.filename}`;
      }

      const authors = await this.prismaService.author.findMany({
        where: {
          author_id: { in: dto.author_ids },
        },
      });

      if (authors.length !== dto.author_ids.length) {
        throw new NotFoundException('Một hoặc nhiều tác giả không tồn tại');
      }

      const book = await this.prismaService.book.create({
        data: {
          title: dto.title,
          price: dto.price,
          stock: dto.stock,
          image_url,
          category: {
            connect: { category_id: dto.category_id },
          },
          bookAuthors: {
            create: dto.author_ids.map((authorId) => ({
              author: {
                connect: { author_id: authorId },
              },
            })),
          },
        },
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
          category: true,
        },
      });

      return { message: 'Tạo sách thành công', book };
    } catch (error) {
      handlePrismaError(error, {
        foreignKeyMessage: 'Danh mục hoặc tác giả không tồn tại',
        defaultMessage: 'Tạo sách thất bại',
      });
    }
  }

  async update(id: number, dto: UpdateBookDto, file?: Express.Multer.File) {
    try {
      const existingBook = await this.prismaService.book.findUnique({
        where: { book_id: id },
        include: { bookAuthors: true },
      });

      if (!existingBook) {
        throw new NotFoundException('Sách không tồn tại');
      }

      let image_url = existingBook.image_url;

      if (file) {
        image_url = `/images/${file.filename}`;
      }

      const book = await this.prismaService.book.update({
        where: { book_id: id },
        data: {
          title: dto.title,
          price: dto.price,
          stock: dto.stock,
          image_url,

          ...(dto.category_id && {
            category: {
              connect: { category_id: dto.category_id },
            },
          }),

          ...(dto.author_ids && {
            bookAuthors: {
              deleteMany: {},
              create: dto.author_ids.map((authorId) => ({
                author: {
                  connect: { author_id: authorId },
                },
              })),
            },
          }),
        },
      });

      return { message: 'Cập nhật sách thành công', book };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Sách không tồn tại',
        foreignKeyMessage: 'Danh mục hoặc tác giả không tồn tại',
        defaultMessage: 'Cập nhật sách thất bại',
      });
    }
  }

  async findAll() {
    try {
      const books = await this.prismaService.book.findMany({
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
          category: true,
        },
        orderBy: { created_at: 'desc' },
      });

      return {
        message: 'Lấy danh sách sách thành công',
        books,
      };
    } catch (error) {
      handlePrismaError(error, {
        defaultMessage: 'Lấy danh sách sách thất bại',
      });
    }
  }

  async findOne(id: number) {
    try {
      const book = await this.prismaService.book.findUnique({
        where: { book_id: id },
      });

      if (!book) {
        throw new NotFoundException('Sách không tồn tại');
      }

      return { message: 'Lấy chi tiết sách thành công', book };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Sách không tồn tại',
        defaultMessage: 'Lấy chi tiết sách thất bại',
      });
    }
  }

  async remove(id: number) {
    try {
      const existingBook = await this.prismaService.book.findUnique({
        where: { book_id: id },
      });

      if (!existingBook) {
        throw new NotFoundException('Sách không tồn tại');
      }

      const book = await this.prismaService.book.delete({
        where: { book_id: id },
      });

      return { message: 'Xóa sách thành công', book };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Sách không tồn tại',
        defaultMessage: 'Xóa sách thất bại',
      });
    }
  }

  async getAuthorsByBook(bookId: number) {
    try {
      const book = await this.prismaService.book.findUnique({
        where: { book_id: bookId },
        select: {
          book_id: true,
          title: true,
          bookAuthors: {
            select: {
              author: {
                select: {
                  author_id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!book) {
        throw new NotFoundException('Sách không tồn tại');
      }

      return {
        message: 'Lấy danh sách tác giả của sách thành công',
        book_id: book.book_id,
        title: book.title,
        authors: book.bookAuthors.map((ba) => ba.author),
      };
    } catch (error) {
      handlePrismaError(error, {
        notFoundMessage: 'Sách không tồn tại',
        defaultMessage: 'Lấy danh sách tác giả của sách thất bại',
      });
    }
  }
}
