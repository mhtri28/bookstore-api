import { Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Author, Prisma } from '../../generated/prisma/client';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}
  async author(authorWhereUniqueInput: Prisma.AuthorWhereUniqueInput): Promise<Author | null> {
    return this.prisma.author.findUnique({
      where: authorWhereUniqueInput,
    });
  }

  async authors(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AuthorWhereUniqueInput;
    where?: Prisma.AuthorWhereInput;
    orderBy?: Prisma.AuthorOrderByWithRelationInput;
  }): Promise<Author[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.author.findMany({
      skip,
      take,
      cursor,
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
