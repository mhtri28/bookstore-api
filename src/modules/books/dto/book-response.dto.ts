import { BookModel } from 'src/generated/prisma/models';

export class CreateBookResDTO {
  message: string;
  book: BookModel;

  constructor(partial: Partial<CreateBookResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateBookResDTO extends CreateBookResDTO {}

export class GetBookResDTO extends CreateBookResDTO {}

export class GetBooksResDTO {
  message: string;
  books: BookModel[];

  constructor(partial: Partial<GetBooksResDTO>) {
    Object.assign(this, partial);
  }
}

export class DeleteBookResDTO {
  message: string;
  book?: BookModel;

  constructor(partial: Partial<DeleteBookResDTO>) {
    Object.assign(this, partial);
  }
}

export class GetBookAuthorsResDTO {
  message: string;
  book_id: number;
  title: string;
  authors: { author_id: number; name: string }[];

  constructor(partial: Partial<GetBookAuthorsResDTO>) {
    Object.assign(this, partial);
  }
}
