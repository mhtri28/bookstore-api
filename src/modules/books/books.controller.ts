import {
  Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  CreateBookResDTO, DeleteBookResDTO, GetBookAuthorsResDTO, GetBookResDTO, GetBooksResDTO, UpdateBookResDTO,
} from './dto/book-response.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { Role } from 'src/generated/prisma/enums';
import { UploadImageInterceptor } from 'src/shared/interceptors/upload-image.interceptor';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiConsumes('multipart/form-data')
  @Auth(Role.ADMIN)
  @Post()
  @UseInterceptors(UploadImageInterceptor('images'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateBookDto) {
    const result = await this.booksService.create(dto, file);
    return new CreateBookResDTO(result);
  }

  @ApiOperation({ summary: 'Get authors of a specific book' })
  @Get(':id/authors')
  async getAuthorsByBook(@Param('id', ParseIntPipe) id: number) {
    const result = await this.booksService.getAuthorsByBook(id);
    return new GetBookAuthorsResDTO(result);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing book' })
  @ApiConsumes('multipart/form-data')
  @Auth(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(UploadImageInterceptor('images'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateBookDto,
  ) {
    const result = await this.booksService.update(id, dto, file);
    return new UpdateBookResDTO(result);
  }

  @ApiOperation({ summary: 'Get all books' })
  @Get()
  async findAll() {
    const result = await this.booksService.findAll();
    return new GetBooksResDTO(result);
  }

  @ApiOperation({ summary: 'Get a book by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.booksService.findOne(id);
    return new GetBookResDTO(result);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a book' })
  @Auth(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.booksService.remove(id);
    return new DeleteBookResDTO(result);
  }
}