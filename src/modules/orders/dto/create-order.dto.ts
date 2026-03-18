import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {

  @ApiProperty({
    example: 1,
    description: 'Book ID',
  })
  @IsInt()
  book_id: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of book',
  })
  @IsInt()
  quantity: number;
}

export class CreateOrderDto {

  @ApiProperty({
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  receiver_name: string;

  @ApiProperty({
    example: '0988888888',
  })
  @IsString()
  @IsNotEmpty()
  receiver_phone: string;

  @ApiProperty({
    example: '123 Le Loi, Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  shipping_address: string;

  @ApiPropertyOptional({
    example: 'SUMMER10',
  })
  @IsOptional()
  @IsString()
  discount_code?: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}