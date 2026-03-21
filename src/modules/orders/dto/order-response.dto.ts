import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../generated/prisma/enums';

export class OrderItemResponseDto {

  @ApiProperty({ example: 1 })
  book_id: number;

  @ApiProperty({ example: 'Clean Code' })
  title: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 120000 })
  price: number;
}

export class OrderResponseDto {

  @ApiProperty({ example: 1 })
  order_id: number;

  @ApiProperty({ example: 'PENDING' })
  status: OrderStatus;

  @ApiProperty({ example: 240000 })
  total_price: number;

  @ApiProperty({ example: 20000 })
  discount_amount: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({
    example: {
      code: 'SUMMER10',
      discount_amount: 20000,
    },
    required: false,
  })
  discount?: {
    code: string;
    discount_amount: number;
  };

  @ApiProperty({
    type: [OrderItemResponseDto],
  })
  items: OrderItemResponseDto[];
}