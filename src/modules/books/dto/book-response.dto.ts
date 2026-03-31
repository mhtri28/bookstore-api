import type { BookModel } from 'src/generated/prisma/models';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookResDTO {
  @ApiProperty({ example: 'Book created successfully' })
  message: string;

  @ApiProperty({ type: Object })
  book: BookModel;

  constructor(partial: Partial<CreateBookResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateBookResDTO extends CreateBookResDTO {}

export class GetBookResDTO extends CreateBookResDTO {}

export class GetBooksResDTO {
  @ApiProperty({ example: 'Books retrieved successfully' })
  message: string;

  @ApiProperty({ type: [Object] })
  books: BookModel[];

  constructor(partial: Partial<GetBooksResDTO>) {
    Object.assign(this, partial);
  }
}

export class DeleteBookResDTO {
  @ApiProperty({ example: 'Book deleted successfully' })
  message: string;

  @ApiProperty({ type: Object, required: false })
  book?: BookModel;

  constructor(partial: Partial<DeleteBookResDTO>) {
    Object.assign(this, partial);
  }
}

export class GetBookAuthorsResDTO {
  @ApiProperty({ example: 'Authors retrieved successfully' })
  message: string;

  @ApiProperty({ example: 1 })
  book_id: number;

  @ApiProperty({ example: 'Harry Potter' })
  title: string;

  @ApiProperty({ example: [{ author_id: 1, name: 'J.K. Rowling' }] })
  authors: { author_id: number; name: string }[];

  constructor(partial: Partial<GetBookAuthorsResDTO>) {
    Object.assign(this, partial);
  }
}