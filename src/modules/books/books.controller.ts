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
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateBookDto) {
    return this.booksService.create(dto, file);
  }
  @Get(':id/authors')
  getAuthorsByBook(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.getAuthorsByBook(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto, file);
  }

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
