import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiscountDto {
  @ApiProperty({ example: 'SUMMER2026' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Summer discount 10%' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['PERCENTAGE', 'FIXED_AMOUNT'], example: 'PERCENTAGE' })
  @IsIn(['PERCENTAGE', 'FIXED_AMOUNT'])
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  discount_value: number;

  @ApiPropertyOptional({ example: 50.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_discount_amount?: number;

  @ApiPropertyOptional({ example: 100.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_order_value?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z' })
  @IsDateString()
  start_at: string;

  @ApiProperty({ example: '2026-08-31T23:59:59Z' })
  @IsDateString()
  expires_at: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  usage_limit?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  used_count: number;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}