import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../../generated/prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private mapOrder(order: any) {
    return {
      order_id: order.order_id,
      status: order.status,
      total_price: Number(order.totalPrice),
      discount_amount: Number(order.discount_amount),
      created_at: order.created_at,
      discount: order.discount ? { code: order.discount.code } : null,
      items: order.items.map((item) => ({
        order_item_id: item.orderitem_id,
        book_id: item.book_id,
        title: item.book.title,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    };
  }

  @Post()
  async create(
    @Body('user_id', ParseIntPipe) userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.ordersService.create(userId, dto);
    return this.mapOrder(order);
  }

  @Get()
  async findAll() {
    const orders = await this.ordersService.findAll();
    return orders.map((o) => this.mapOrder(o));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.findOne(id);
    return this.mapOrder(order);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    const order = await this.ordersService.updateStatus(id, status);
    return this.mapOrder(order);
  }
}
