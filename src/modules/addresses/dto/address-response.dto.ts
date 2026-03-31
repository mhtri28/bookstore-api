import { AddressModel } from 'src/generated/prisma/models';

export class CreateAddressResDTO {
  message: string;
  address: AddressModel;

  constructor(partial: Partial<CreateAddressResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateAddressResDTO extends CreateAddressResDTO {}

export class GetAddressResDTO extends CreateAddressResDTO {}

export class GetAddressesResDTO {
  message: string;
  addresses: AddressModel[];

  constructor(partial: Partial<GetAddressesResDTO>) {
    Object.assign(this, partial);
  }
}

export class AddressMessageResDTO {
  message: string;

  constructor(partial: Partial<AddressMessageResDTO>) {
    Object.assign(this, partial);
  }
}
