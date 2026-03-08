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
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';

@ApiTags('discounts')
@ApiBearerAuth()
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Auth(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Admin create discount' })
  @ApiBody({ type: CreateDiscountDto })
  create(@Body() dto: CreateDiscountDto) {
    return this.discountsService.create(dto);
  }

  @Auth(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Admin get all discounts' })
  findAll() {
    return this.discountsService.findAll();
  }

  @Auth(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Admin get discount by id' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.findOne(id);
  }

  @Auth(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin update discount' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateDiscountDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ) {
    return this.discountsService.update(id, dto);
  }

  @Auth(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin delete discount' })
  @ApiParam({ name: 'id', example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }

  @Auth(Role.USER)
  @Post('apply')
  @ApiOperation({ summary: 'User apply discount code' })
  @ApiBody({ type: ApplyDiscountDto })
  applyDiscount(@Body() dto: ApplyDiscountDto) {
    return this.discountsService.applyDiscount(dto);
  }
}