import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../../generated/prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { Role } from 'src/generated/prisma/enums';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
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

  @Auth(Role.USER)
  @Post()
  @ApiOperation({ summary: 'User create order' })
  @ApiBody({ type: CreateOrderDto })
  async create(
    @ActiveUser('userId') userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.ordersService.create(userId, dto);
    return this.mapOrder(order);
  }

  @Auth(Role.USER)
  @Get()
  @ApiOperation({ summary: 'User get orders' })
  async findAll() {
    const orders = await this.ordersService.findAll();
    return orders.map((o) => this.mapOrder(o));
  }

  @Auth(Role.USER)
  @Get(':id')
  @ApiOperation({ summary: 'User get order by id' })
  @ApiParam({ name: 'id', example: 1 })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.findOne(id);
    return this.mapOrder(order);
  }

  @Auth(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin update order status' })
  @ApiParam({ name: 'id', example: 1 })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    const order = await this.ordersService.updateStatus(id, status);
    return this.mapOrder(order);
  }
}