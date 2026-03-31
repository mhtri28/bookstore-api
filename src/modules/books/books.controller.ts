import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  CreateBookResDTO,
  DeleteBookResDTO,
  GetBookAuthorsResDTO,
  GetBookResDTO,
  GetBooksResDTO,
  UpdateBookResDTO,
} from './dto/book-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Auth()
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './src/public/images',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateBookDto) {
    const result = await this.booksService.create(dto, file);
    return new CreateBookResDTO(result);
  }

  @Get(':id/authors')
  async getAuthorsByBook(@Param('id', ParseIntPipe) id: number) {
    const result = await this.booksService.getAuthorsByBook(id);
    return new GetBookAuthorsResDTO(result);
  }
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './src/public/images',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateBookDto,
  ) {
    const result = await this.booksService.update(id, dto, file);
    return new UpdateBookResDTO(result);
  }

  @Get()
  async findAll() {
    const result = await this.booksService.findAll();
    return new GetBooksResDTO(result);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.booksService.findOne(id);
    return new GetBookResDTO(result);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.booksService.remove(id);
    return new DeleteBookResDTO(result);
  }
}
