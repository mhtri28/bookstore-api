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
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { DiscountsService } from 'src/modules/discounts/discounts.service';

@Auth(Role.ADMIN)
@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  create(@Body() dto: CreateDiscountDto) {
    return this.discountsService.create(dto);
  }

  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ) {
    return this.discountsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }

  @Post('apply')
  applyDiscount(@Body() dto: ApplyDiscountDto) {
    return this.discountsService.applyDiscount(dto);
  }
}
