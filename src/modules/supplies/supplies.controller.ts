import { Controller, Get, Post, Body, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { SuppliesService } from './supplies.service';
import { UpdateSupplyBodyDTO } from './dto/update-supply.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { CreateSupplyBodyDTO } from './dto/create-supply.dto';
import { GetSuppliesQueryDTO } from './dto/get-supplies-query.dto';
import {
  ActionSupplyResDTO, CreateSupplyResDTO, GetSuppliesResDTO, GetSupplyResDTO, UpdateSupplyResDTO,
} from './dto/supply-response.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Supplies')
@ApiBearerAuth()
@Auth(Role.ADMIN)
@Controller('supplies')
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @ApiOperation({ summary: 'Create a new supply import' })
  @Post()
  async create(@Body() body: CreateSupplyBodyDTO) {
    const result = await this.suppliesService.create(body);
    return new CreateSupplyResDTO(result);
  }

  @ApiOperation({ summary: 'Get all supplies' })
  @Get()
  async findAll(@Query() query: GetSuppliesQueryDTO) {
    const result = await this.suppliesService.findAll(query);
    return new GetSuppliesResDTO(result);
  }

  @ApiOperation({ summary: 'Get a specific supply' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.suppliesService.findOne(id);
    return new GetSupplyResDTO(result);
  }

  @ApiOperation({ summary: 'Update a supply' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSupplyBodyDTO,
  ) {
    const result = await this.suppliesService.update(id, body);
    return new UpdateSupplyResDTO(result);
  }

  @ApiOperation({ summary: 'Cancel a supply' })
  @Patch(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const result = await this.suppliesService.cancel(id);
    return new ActionSupplyResDTO(result);
  }

  @ApiOperation({ summary: 'Complete a supply' })
  @Patch(':id/complete')
  async complete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.suppliesService.complete(id);
    return new ActionSupplyResDTO(result);
  }
}