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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierStatusDto } from './dto/update-status-supplier.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Auth(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Admin create supplier' })
  @ApiBody({ type: CreateSupplierDto })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Auth(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Admin get all suppliers' })
  findAll() {
    return this.suppliersService.findAll();
  }

  @Auth(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Admin get supplier by id' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Auth(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin update supplier' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateSupplierDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, dto);
  }

  @Auth(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin update supplier status' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateSupplierStatusDto })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierStatusDto,
  ) {
    return this.suppliersService.updateStatus(id, dto);
  }

  @Auth(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin delete supplier' })
  @ApiParam({ name: 'id', example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }
}