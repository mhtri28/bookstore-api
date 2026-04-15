import { IsInt, IsOptional, ValidateNested, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderItemDto extends CreateOrderItemDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  order_item_id?: number;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  receiver_name?: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  receiver_phone?: string;

  @ApiPropertyOptional({ example: '456 Another Street' })
  @IsOptional()
  @IsString()
  shipping_address?: string;

  @ApiPropertyOptional({ type: [UpdateOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];
}