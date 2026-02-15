import { CommonStatus } from 'src/generated/prisma/enums';

export class BookModel {
  book_id: number;
  title: string;
  price: number;
  stock: number;
  image_url: string;
  status: CommonStatus;
  created_at: Date;
  updated_at: Date;

  constructor(partial: Partial<BookModel>) {
    Object.assign(this, partial);

    if (this.price) {
      this.price = Number(this.price);
    }
  }
}
