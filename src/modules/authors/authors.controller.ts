import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';
import {
  CreateAuthorResDTO,
  DeleteAuthorResDTO,
  GetAuthorResDTO,
  GetAuthorsResDTO,
  UpdateAuthorResDTO,
} from './dto/author-response.dto';
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  async create(@Body() authorData: CreateAuthorDto) {
    const result = await this.authorsService.create(authorData);
    return new CreateAuthorResDTO(result);
  }

  @Get()
  async findAll(@Query() query: QueryAuthorDto) {
    const result = await this.authorsService.authors(query);
    return new GetAuthorsResDTO(result);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.authorsService.author({ author_id: id });
    return new GetAuthorResDTO(result);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateAuthorDto: UpdateAuthorDto) {
    const result = await this.authorsService.updateAuthor({ where: { author_id: id }, data: updateAuthorDto });
    return new UpdateAuthorResDTO(result);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.authorsService.deleteAuthor({ author_id: id });
    return new DeleteAuthorResDTO(result);
  }
}
