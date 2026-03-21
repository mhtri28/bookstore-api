import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyDiscountDto {

  @ApiProperty({
    example: 'SUMMER10',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 300000,
  })
  @IsNumber()
  order_total: number;
}