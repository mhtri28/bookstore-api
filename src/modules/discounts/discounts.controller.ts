import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import {
  CreateDiscountResDTO,
  UpdateDiscountResDTO,
  GetDiscountResDTO,
  GetDiscountsResDTO,
  DeleteDiscountResDTO,
  ApplyDiscountResDTO,
} from './dto/discount-response.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Auth(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateDiscountDto) {
    const result = await this.discountsService.create(dto);
    return new CreateDiscountResDTO(result);
  }

  @Auth(Role.ADMIN)
  @Get()
  async findAll() {
    const result = await this.discountsService.findAll();
    return new GetDiscountsResDTO(result);
  }

  @Auth(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.discountsService.findOne(id);
    return new GetDiscountResDTO(result);
  }

  @Auth(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ) {
    const result = await this.discountsService.update(id, dto);
    return new UpdateDiscountResDTO(result);
  }

  @Auth(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.discountsService.remove(id);
    return new DeleteDiscountResDTO(result);
  }

  @Auth(Role.USER)
  @Post('apply')
  async applyDiscount(@Body() dto: ApplyDiscountDto) {
    const result = await this.discountsService.applyDiscount(dto);
    return new ApplyDiscountResDTO(result);
  }
}