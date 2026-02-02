import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApplyDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  order_total: number;
}
