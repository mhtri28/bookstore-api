import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressBodyDTO } from './create-address.dto';

export class UpdateAddressBodyDTO extends PartialType(CreateAddressBodyDTO) {}
