import { Type } from 'class-transformer';
import { IsBoolean, IsString, Length, Matches } from 'class-validator';
import { AddressModel } from 'src/generated/prisma/models';

export class CreateAddressBodyDTO {
  @IsString()
  @Length(3, 255, { message: 'Tên địa chỉ phải có độ dài từ 3 đến 255 ký tự' })
  name: string;

  @IsString()
  @Matches(/^[0-9]+$/, { message: 'Số điện thoại chỉ được chứa số' })
  @Length(10, 15)
  phone: string;

  @IsString()
  @Length(10, 500, { message: 'Địa chỉ phải có độ dài từ 10 đến 500 ký tự' })
  shippingAddress: string;

  @Type(() => Boolean)
  @IsBoolean()
  isDefault: boolean;
}

export class CreateAddressResDTO {
  message: string;
  address: AddressModel;

  constructor(partial: Partial<CreateAddressResDTO>) {
    Object.assign(this, partial);
  }
}
