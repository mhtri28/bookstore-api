import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Author, Prisma } from '../../generated/prisma/client';
import { QueryAuthorDto } from './dto/query-author.dto';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}
  async author(authorWhereUniqueInput: Prisma.AuthorWhereUniqueInput): Promise<Author | null> {
    return this.prisma.author.findUnique({
      where: authorWhereUniqueInput,
    });
  }

  async authors(query: QueryAuthorDto): Promise<Author[]> {
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

    return this.prisma.author.findMany({
      skip: query.skip,
      take: query.take,
      where,
      orderBy,
    });
  }
  async create(data: Prisma.AuthorCreateInput): Promise<Author> {
    return this.prisma.author.create({
      data,
    });
  }

  async updateAuthor(params: {
    where: Prisma.AuthorWhereUniqueInput;
    data: Prisma.AuthorUpdateInput;
  }): Promise<Author> {
    const { where, data } = params;
    return this.prisma.author.update({
      data,
      where,
    });
  }

  async deleteAuthor(where: Prisma.AuthorWhereUniqueInput): Promise<Author> {
    return this.prisma.author.delete({
      where,
    });
  }
}
