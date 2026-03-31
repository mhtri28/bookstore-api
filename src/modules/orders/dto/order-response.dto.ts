import { OrderStatus } from 'src/generated/prisma/enums';

export class MappedOrderItem {
  order_item_id: number;
  book_id: number;
  title: string;
  quantity: number;
  price: number;
}

export class MappedOrderDiscount {
  code: string;
}

export class MappedOrder {
  order_id: number;
  status: OrderStatus;
  total_price: number;
  discount_amount: number;
  created_at: Date;
  discount: MappedOrderDiscount | null;
  items: MappedOrderItem[];
}

export class CreateOrderResDTO {
  message: string;
  order: MappedOrder;

  constructor(partial: Partial<CreateOrderResDTO>) {
    Object.assign(this, partial);
  }
}

export class GetOrderResDTO extends CreateOrderResDTO {}

export class UpdateOrderStatusResDTO extends CreateOrderResDTO {}

export class GetOrdersResDTO {
  message: string;
  orders: MappedOrder[];

  constructor(partial: Partial<GetOrdersResDTO>) {
    Object.assign(this, partial);
  }
}