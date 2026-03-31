import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ApplyDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @Type(() => Number)
  @IsNumber()
  order_total: number;
}