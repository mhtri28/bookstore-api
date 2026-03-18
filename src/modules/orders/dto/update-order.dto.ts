import { IsInt, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order.dto';

export class UpdateOrderItemDto extends CreateOrderItemDto {

  @ApiPropertyOptional({
    example: 10,
  })
  @IsOptional()
  @IsInt()
  order_item_id?: number;
}

export class UpdateOrderDto {

  @ApiPropertyOptional({ example: 'Nguyen Van B' })
  @IsOptional()
  receiver_name?: string;

  @ApiPropertyOptional({ example: '0999999999' })
  @IsOptional()
  receiver_phone?: string;

  @ApiPropertyOptional({ example: '456 Tran Hung Dao, HCM' })
  @IsOptional()
  shipping_address?: string;

  @ApiPropertyOptional({
    type: [UpdateOrderItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];
}