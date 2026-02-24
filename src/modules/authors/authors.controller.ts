import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author as AuthorModel, Prisma } from '../../generated/prisma/client';
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  async create(@Body() authorData: CreateAuthorDto): Promise<AuthorModel> {
    return this.authorsService.create(authorData);
  }

  @Get()
  findAll(
    @Query() skip?: number,
    @Query() take?: number,
    @Query() cursor?: Prisma.AuthorWhereUniqueInput,
    @Query() where?: Prisma.AuthorWhereInput,
    @Query() orderBy?: Prisma.AuthorOrderByWithRelationInput,
  ) {
    return this.authorsService.authors({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorsService.author({ author_id: Number(id) });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorsService.updateAuthor({ where: { author_id: Number(id) }, data: updateAuthorDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authorsService.deleteAuthor({ author_id: Number(id) });
  }
}
