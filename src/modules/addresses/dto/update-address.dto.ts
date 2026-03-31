import { PartialType } from '@nestjs/swagger'; 
import { CreateAddressBodyDTO } from './create-address.dto';

export class UpdateAddressBodyDTO extends PartialType(CreateAddressBodyDTO) {}