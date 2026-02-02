import { IsInt, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from 'src/modules/orders/dto/create-order.dto';

export class UpdateOrderItemDto extends CreateOrderItemDto {
  @IsOptional()
  @IsInt()
  order_item_id?: number;
}

export class UpdateOrderDto {
  @IsOptional()
  receiver_name?: string;

  @IsOptional()
  receiver_phone?: string;

  @IsOptional()
  shipping_address?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];
}
