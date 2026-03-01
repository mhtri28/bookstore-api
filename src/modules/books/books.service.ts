import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BooksService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateBookDto, file?: Express.Multer.File) {
    let image_url: string | null = null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      image_url = uploadResult.secure_url;
    }
    const authors = await this.prisma.author.findMany({
      where: {
        author_id: { in: dto.author_ids },
      },
    });

    if (authors.length !== dto.author_ids.length) {
      throw new NotFoundException('One or more authors not found');
    }
    return this.prisma.book.create({
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
  }

  async update(id: number, dto: UpdateBookDto, file?: Express.Multer.File) {
    const existingBook = await this.prisma.book.findUnique({
      where: { book_id: id },
      include: { bookAuthors: true },
    });

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    let image_url = existingBook.image_url;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      image_url = uploadResult.secure_url;
    }

    return this.prisma.book.update({
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
  }

  async findAll() {
    return this.prisma.book.findMany({
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
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { book_id: id },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async remove(id: number) {
    const existingBook = await this.prisma.book.findUnique({
      where: { book_id: id },
    });

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }
    return this.prisma.book.delete({
      where: { book_id: id },
    });
  }
  async getAuthorsByBook(bookId: number) {
    const book = await this.prisma.book.findUnique({
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
      throw new NotFoundException('Book not found');
    }

    return {
      book_id: book.book_id,
      title: book.title,
      authors: book.bookAuthors.map((ba) => ba.author),
    };
  }
}
