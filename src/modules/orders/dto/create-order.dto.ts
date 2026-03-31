import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  book_id: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  receiver_name: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  receiver_phone: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  shipping_address: string;

  @ApiPropertyOptional({ example: 'SUMMER2026' })
  @IsOptional()
  @IsString()
  discount_code?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}