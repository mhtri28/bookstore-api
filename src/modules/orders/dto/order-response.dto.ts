import { OrderStatus } from 'src/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MappedOrderItem {
  @ApiProperty({ example: 1 })
  order_item_id: number;
  @ApiProperty({ example: 101 })
  book_id: number;
  @ApiProperty({ example: 'Harry Potter' })
  title: string;
  @ApiProperty({ example: 2 })
  quantity: number;
  @ApiProperty({ example: 15.99 })
  price: number;
}

export class MappedOrderDiscount {
  @ApiProperty({ example: 'SUMMER2026' })
  code: string;
}

export class MappedOrder {
  @ApiProperty({ example: 1 })
  order_id: number;
  @ApiProperty({ enum: OrderStatus, example: 'PENDING' })
  status: OrderStatus;
  @ApiProperty({ example: 100.00 })
  total_price: number;
  @ApiProperty({ example: 10.00 })
  discount_amount: number;
  @ApiProperty({ example: '2026-03-31T00:00:00Z' })
  created_at: Date;
  @ApiPropertyOptional({ type: () => MappedOrderDiscount, nullable: true })
  discount: MappedOrderDiscount | null;
  @ApiProperty({ type: [MappedOrderItem] })
  items: MappedOrderItem[];
}

export class CreateOrderResDTO {
  @ApiProperty({ example: 'Order created successfully' })
  message: string;
  @ApiProperty({ type: () => MappedOrder })
  order: MappedOrder;

  constructor(partial: Partial<CreateOrderResDTO>) {
    Object.assign(this, partial);
  }
}

export class GetOrderResDTO extends CreateOrderResDTO {}

export class UpdateOrderStatusResDTO extends CreateOrderResDTO {}

export class GetOrdersResDTO {
  @ApiProperty({ example: 'Orders retrieved successfully' })
  message: string;
  @ApiProperty({ type: [MappedOrder] })
  orders: MappedOrder[];

  constructor(partial: Partial<GetOrdersResDTO>) {
    Object.assign(this, partial);
  }
}