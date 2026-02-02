import { OrderStatus } from '../../../generated/prisma/enums';

export class OrderItemResponseDto {
  book_id: number;
  title: string;
  quantity: number;
  price: number;
}

export class OrderResponseDto {
  order_id: number;
  status: OrderStatus;
  total_price: number;
  discount_amount: number;
  created_at: Date;

  discount?: {
    code: string;
    discount_amount: number;
  };

  items: OrderItemResponseDto[];
}
