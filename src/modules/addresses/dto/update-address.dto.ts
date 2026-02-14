import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressBodyDTO, CreateAddressResDTO } from './create-address.dto';

export class UpdateAddressBodyDTO extends PartialType(CreateAddressBodyDTO) {}

export class UpdateAddressResDTO extends CreateAddressResDTO {}
