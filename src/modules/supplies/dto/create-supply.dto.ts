import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';
import { SupplyModel } from 'src/shared/models/supply.model';

export class CreateSupplyDetailDTO {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  bookId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  importedPrice: number;
}

export class CreateSupplyBodyDTO {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  supplierId: number;

  @IsOptional()
  @IsDateString()
  importedAt?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSupplyDetailDTO)
  details: CreateSupplyDetailDTO[];
}

export class CreateSupplyResDTO {
  message: string;
  supply: SupplyModel;

  constructor(partial: Partial<CreateSupplyResDTO>) {
    Object.assign(this, partial);
  }
}
