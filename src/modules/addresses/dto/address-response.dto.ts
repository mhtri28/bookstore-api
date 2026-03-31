import type { AddressModel } from 'src/generated/prisma/models';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressResDTO {
  @ApiProperty({ example: 'Address created successfully' })
  message: string;
  
  @ApiProperty({ type: Object })
  address: AddressModel;

  constructor(partial: Partial<CreateAddressResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateAddressResDTO extends CreateAddressResDTO {}

export class GetAddressResDTO extends CreateAddressResDTO {}

export class GetAddressesResDTO {
  @ApiProperty({ example: 'Addresses retrieved successfully' })
  message: string;
  
  @ApiProperty({ type: [Object] })
  addresses: AddressModel[];

  constructor(partial: Partial<GetAddressesResDTO>) {
    Object.assign(this, partial);
  }
}

export class AddressMessageResDTO {
  @ApiProperty({ example: 'Action successful' })
  message: string;

  constructor(partial: Partial<AddressMessageResDTO>) {
    Object.assign(this, partial);
  }
}