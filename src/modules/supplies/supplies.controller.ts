import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SuppliesService } from './supplies.service';
import { UpdateSupplyBodyDTO } from './dto/update-supply.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { CreateSupplyBodyDTO } from './dto/create-supply.dto';
import { GetSuppliesQueryDTO } from './dto/get-supplies-query.dto';
import {
  ActionSupplyResDTO,
  CreateSupplyResDTO,
  GetSuppliesResDTO,
  GetSupplyResDTO,
  UpdateSupplyResDTO,
} from './dto/supply-response.dto';

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
  async findAll(@Query() query: GetSuppliesQueryDTO) {
    const result = await this.suppliesService.findAll(query);
    return new GetSuppliesResDTO(result);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.suppliesService.findOne(id);
    return new GetSupplyResDTO(result);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSupplyBodyDTO,
  ) {
    const result = await this.suppliesService.update(id, body);
    return new UpdateSupplyResDTO(result);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const result = await this.suppliesService.cancel(id);
    return new ActionSupplyResDTO(result);
  }

  @Patch(':id/complete')
  async complete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.suppliesService.complete(id);
    return new ActionSupplyResDTO(result);
  }
}