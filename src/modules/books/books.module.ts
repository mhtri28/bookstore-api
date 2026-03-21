import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService, CloudinaryService],
})
export class BooksModule {}
