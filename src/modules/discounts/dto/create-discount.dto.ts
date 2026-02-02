import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['PERCENTAGE', 'FIXED_AMOUNT'])
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @IsNumber()
  discount_value: number;

  @IsOptional()
  @IsNumber()
  max_discount_amount?: number;

  @IsOptional()
  @IsNumber()
  min_order_value?: number;

  @IsDateString()
  start_at: string;

  @IsDateString()
  expires_at: string;

  @IsOptional()
  @IsNumber()
  usage_limit?: number;

  @IsOptional()
  @IsNumber()
  used_count: number;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
