import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDiscountDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @IsOptional()
  @IsNumber()
  max_discount_amount?: number;

  @IsOptional()
  @IsNumber()
  min_order_value?: number;

  @IsOptional()
  @IsNumber()
  usage_limit?: number;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
