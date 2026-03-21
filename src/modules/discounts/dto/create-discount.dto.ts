import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiscountDto {

  @ApiProperty({
    example: 'SUMMER10',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    example: 'Summer promotion',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'PERCENTAGE',
    enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
  })
  @IsIn(['PERCENTAGE', 'FIXED_AMOUNT'])
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @ApiProperty({
    example: 10,
  })
  @IsNumber()
  discount_value: number;

  @ApiPropertyOptional({
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  max_discount_amount?: number;

  @ApiPropertyOptional({
    example: 200000,
  })
  @IsOptional()
  @IsNumber()
  min_order_value?: number;

  @ApiProperty({
    example: '2026-01-01',
  })
  @IsDateString()
  start_at: string;

  @ApiProperty({
    example: '2026-12-31',
  })
  @IsDateString()
  expires_at: string;

  @ApiPropertyOptional({
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  usage_limit?: number;

  @ApiPropertyOptional({
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  used_count: number;

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}