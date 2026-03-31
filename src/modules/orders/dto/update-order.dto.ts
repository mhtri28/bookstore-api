import { IsInt, IsOptional, ValidateNested, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order.dto';

export class UpdateOrderItemDto extends CreateOrderItemDto {
  @IsOptional()
  @IsInt()
  order_item_id?: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  receiver_name?: string;

  @IsOptional()
  @IsString()
  receiver_phone?: string;

  @IsOptional()
  @IsString()
  shipping_address?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];
}