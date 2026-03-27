import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressBodyDTO, CreateAddressResDTO } from './dto/create-address.dto';
import { UpdateAddressBodyDTO, UpdateAddressResDTO } from './dto/update-address.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { GetAddressResDTO } from 'src/modules/addresses/dto/get-address.dto';

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
  findAll(@ActiveUser('userId') userId: number) {
    return this.addressesService.findAll(userId);
  }

  @Get(':id')
  async findOne(@ActiveUser('userId') userId: number, @Param('id') id: string) {
    const result = await this.addressesService.findOne(userId, Number(id));
    return new GetAddressResDTO(result);
  }

  @Patch(':id/set-default')
  setDefault(@ActiveUser('userId') userId: number, @Param('id') id: string) {
    return this.addressesService.setDefault(userId, Number(id));
  }

  @Patch(':id')
  async update(@ActiveUser('userId') userId: number, @Param('id') id: string, @Body() body: UpdateAddressBodyDTO) {
    const result = await this.addressesService.update(userId, Number(id), body);
    return new UpdateAddressResDTO(result);
  }

  @Delete(':id')
  remove(@ActiveUser('userId') userId: number, @Param('id') id: string) {
    return this.addressesService.remove(userId, Number(id));
  }
}
