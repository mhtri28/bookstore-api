import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../../generated/prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { Role } from 'src/generated/prisma/enums';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import {
  CreateOrderResDTO, GetOrderResDTO, GetOrdersResDTO, UpdateOrderStatusResDTO,
} from './dto/order-response.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @Auth(Role.USER)
  @Post()
  async create(
    @ActiveUser('userId') userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    const result = await this.ordersService.create(userId, dto);
    return new CreateOrderResDTO(result);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @Auth(Role.ADMIN)
  @Get()
  async findAll() {
    const result = await this.ordersService.findAll();
    return new GetOrdersResDTO(result);
  }

  @ApiOperation({ summary: 'Get order details by ID' })
  @Auth()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.ordersService.findOne(id);
    return new GetOrderResDTO(result);
  }

  @ApiOperation({ summary: 'Update order status' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', example: 'COMPLETED' } } } })
  @Auth(Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    const result = await this.ordersService.updateStatus(id, status);
    return new UpdateOrderStatusResDTO(result);
  }
}