import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplyDetailDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  bookId: number;

  @ApiProperty({ example: 50 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 10.5 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  importedPrice: number;
}

export class CreateSupplyBodyDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  supplierId: number;

  @ApiPropertyOptional({ example: '2026-03-31T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  importedAt?: string;

  @ApiProperty({ type: [CreateSupplyDetailDTO] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSupplyDetailDTO)
  details: CreateSupplyDetailDTO[];
}