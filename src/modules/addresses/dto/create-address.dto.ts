import { Type } from 'class-transformer';
import { IsBoolean, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressBodyDTO {
  @ApiProperty({ example: 'Home', description: 'Name of the address' })
  @IsString()
  @Length(3, 255, { message: 'Tên địa chỉ phải có độ dài từ 3 đến 255 ký tự' })
  name: string;

  @ApiProperty({ example: '0123456789', description: 'Contact phone number' })
  @IsString()
  @Matches(/^[0-9]+$/, { message: 'Số điện thoại chỉ được chứa số' })
  @Length(10, 15)
  phone: string;

  @ApiProperty({ example: '123 Main Street, New York, NY 10001', description: 'Detailed shipping address' })
  @IsString()
  @Length(10, 500, { message: 'Địa chỉ phải có độ dài từ 10 đến 500 ký tự' })
  shippingAddress: string;

  @ApiProperty({ example: true, description: 'Set as default address' })
  @Type(() => Boolean)
  @IsBoolean()
  isDefault: boolean;
}