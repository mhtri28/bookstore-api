import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author as AuthorModel, Prisma } from '../../generated/prisma/client';
import { QueryAuthorDto } from './dto/query-author.dto';
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  async create(@Body() authorData: CreateAuthorDto): Promise<AuthorModel> {
    return this.authorsService.create(authorData);
  }

  @Get()
  findAll(@Query() query: QueryAuthorDto): Promise<AuthorModel[]> {
    return this.authorsService.authors(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AuthorModel | null> {
    return this.authorsService.author({ author_id: id });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAuthorDto: UpdateAuthorDto): Promise<AuthorModel> {
    return this.authorsService.updateAuthor({ where: { author_id: id }, data: updateAuthorDto });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AuthorModel> {
    return this.authorsService.deleteAuthor({ author_id: id });
  }
}
