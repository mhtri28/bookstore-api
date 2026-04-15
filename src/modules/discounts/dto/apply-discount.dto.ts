import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyDiscountDto {
  @ApiProperty({ example: 'SUMMER2026' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 150.00 })
  @Type(() => Number)
  @IsNumber()
  order_total: number;
}