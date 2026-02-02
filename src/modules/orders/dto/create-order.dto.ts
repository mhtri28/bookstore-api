import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsInt()
  book_id: number;

  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  receiver_name: string;

  @IsString()
  @IsNotEmpty()
  receiver_phone: string;

  @IsString()
  @IsNotEmpty()
  shipping_address: string;

  @IsOptional()
  @IsString()
  discount_code?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
