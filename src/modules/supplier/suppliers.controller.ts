import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierStatusDto } from './dto/update-status-supplier.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';
import {
  CreateSupplierResDTO, DeleteSupplierResDTO, GetSupplierResDTO, GetSuppliersResDTO, UpdateSupplierResDTO,
} from './dto/supplier-response.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @ApiOperation({ summary: 'Create a new supplier' })
  @Auth(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateSupplierDto) {
    const result = await this.suppliersService.create(dto);
    return new CreateSupplierResDTO(result);
  }

  @ApiOperation({ summary: 'Get all suppliers' })
  @Auth(Role.ADMIN)
  @Get()
  async findAll() {
    const result = await this.suppliersService.findAll();
    return new GetSuppliersResDTO(result);
  }

  @ApiOperation({ summary: 'Get a specific supplier by ID' })
  @Auth(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.suppliersService.findOne(id);
    return new GetSupplierResDTO(result);
  }

  @ApiOperation({ summary: 'Update a supplier' })
  @Auth(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
  ) {
    const result = await this.suppliersService.update(id, dto);
    return new UpdateSupplierResDTO(result);
  }

  @ApiOperation({ summary: 'Update supplier status' })
  @Auth(Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierStatusDto,
  ) {
    const result = await this.suppliersService.updateStatus(id, dto);
    return new UpdateSupplierResDTO(result);
  }

  @ApiOperation({ summary: 'Delete a supplier' })
  @Auth(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.suppliersService.remove(id);
    return new DeleteSupplierResDTO(result);
  }
}