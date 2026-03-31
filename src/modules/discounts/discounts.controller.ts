import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import {
  CreateDiscountResDTO, UpdateDiscountResDTO, GetDiscountResDTO, GetDiscountsResDTO, DeleteDiscountResDTO, ApplyDiscountResDTO,
} from './dto/discount-response.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Discounts')
@ApiBearerAuth()
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @ApiOperation({ summary: 'Create a new discount' })
  @Auth(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateDiscountDto) {
    const result = await this.discountsService.create(dto);
    return new CreateDiscountResDTO(result);
  }

  @ApiOperation({ summary: 'Get all discounts' })
  @Auth(Role.ADMIN)
  @Get()
  async findAll() {
    const result = await this.discountsService.findAll();
    return new GetDiscountsResDTO(result);
  }

  @ApiOperation({ summary: 'Get a specific discount' })
  @Auth(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.discountsService.findOne(id);
    return new GetDiscountResDTO(result);
  }

  @ApiOperation({ summary: 'Update a discount' })
  @Auth(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ) {
    const result = await this.discountsService.update(id, dto);
    return new UpdateDiscountResDTO(result);
  }

  @ApiOperation({ summary: 'Delete a discount' })
  @Auth(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.discountsService.remove(id);
    return new DeleteDiscountResDTO(result);
  }

  @ApiOperation({ summary: 'Apply a discount code to an order' })
  @Auth(Role.USER)
  @Post('apply')
  async applyDiscount(@Body() dto: ApplyDiscountDto) {
    const result = await this.discountsService.applyDiscount(dto);
    return new ApplyDiscountResDTO(result);
  }
}