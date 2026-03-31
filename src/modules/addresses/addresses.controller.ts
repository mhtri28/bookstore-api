import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressBodyDTO } from './dto/create-address.dto';
import {
  AddressMessageResDTO,
  CreateAddressResDTO,
  GetAddressResDTO,
  GetAddressesResDTO,
  UpdateAddressResDTO,
} from './dto/address-response.dto';
import { UpdateAddressBodyDTO } from './dto/update-address.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Auth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@ActiveUser('userId') userId: number, @Body() body: CreateAddressBodyDTO) {
    const result = await this.addressesService.create(userId, body);
    return new CreateAddressResDTO(result);
  }

  @Get()
  async findAll(@ActiveUser('userId') userId: number) {
    const result = await this.addressesService.findAll(userId);
    return new GetAddressesResDTO(result);
  }

  @Get(':id')
  async findOne(@ActiveUser('userId') userId: number, @Param('id', ParseIntPipe) id: number) {
    const result = await this.addressesService.findOne(userId, id);
    return new GetAddressResDTO(result);
  }

  @Patch(':id/set-default')
  async setDefault(@ActiveUser('userId') userId: number, @Param('id', ParseIntPipe) id: number) {
    const result = await this.addressesService.setDefault(userId, id);
    return new AddressMessageResDTO(result);
  }

  @Patch(':id')
  async update(
    @ActiveUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAddressBodyDTO,
  ) {
    const result = await this.addressesService.update(userId, id, body);
    return new UpdateAddressResDTO(result);
  }

  @Delete(':id')
  async remove(@ActiveUser('userId') userId: number, @Param('id', ParseIntPipe) id: number) {
    const result = await this.addressesService.remove(userId, id);
    return new AddressMessageResDTO(result);
  }
}
