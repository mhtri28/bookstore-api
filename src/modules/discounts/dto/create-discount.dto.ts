import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['PERCENTAGE', 'FIXED_AMOUNT'])
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @Type(() => Number)
  @IsNumber()
  discount_value: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_discount_amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_order_value?: number;

  @IsDateString()
  start_at: string;

  @IsDateString()
  expires_at: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  usage_limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  used_count: number;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}