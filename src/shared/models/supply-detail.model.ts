import { BookModel } from 'src/shared/models/book.model';

export class SupplyDetailModel {
  supply_detail_id: number;
  book_id: number;
  supply_id: number;
  quantity: number;
  imported_price: number;
  book: BookModel;

  constructor(partial: Partial<SupplyDetailModel>) {
    Object.assign(this, partial);

    // Convert Decimal sang number
    if (this.imported_price) {
      this.imported_price = Number(this.imported_price);
    }

    // Convert nested book model
    if (this.book) {
      this.book = new BookModel(this.book);
    }
  }
}
