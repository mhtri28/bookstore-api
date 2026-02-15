import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { SuppliesService } from './supplies.service';
import { UpdateSupplyBodyDTO, UpdateSupplyResDTO } from './dto/update-supply.dto';
import { Role } from 'src/generated/prisma/browser';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { CreateSupplyBodyDTO, CreateSupplyResDTO } from 'src/modules/supplies/dto/create-supply.dto';
import { GetSuppliesQueryDTO } from 'src/modules/supplies/dto/get-supplies-query.dto';
import { GetSupplyResDTO } from 'src/modules/supplies/dto/get-supply.dto';

@Auth(Role.ADMIN)
@Controller('supplies')
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Post()
  async create(@Body() body: CreateSupplyBodyDTO) {
    const result = await this.suppliesService.create(body);
    return new CreateSupplyResDTO(result);
  }

  @Get()
  findAll(@Query() query: GetSuppliesQueryDTO) {
    return this.suppliesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.suppliesService.findOne(Number(id));
    return new GetSupplyResDTO(result);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateSupplyBodyDTO) {
    const result = await this.suppliesService.update(Number(id), body);
    return new UpdateSupplyResDTO(result);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.suppliesService.cancel(Number(id));
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.suppliesService.complete(Number(id));
  }
}
