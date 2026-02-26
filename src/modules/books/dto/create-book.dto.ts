import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommonStatus } from 'src/generated/prisma/browser';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @Type(() => Number)
  @IsInt()
  category_id: number;

  @IsArray()
  @Type(() => Number)
  @ArrayNotEmpty()
  @IsInt({ each: true })
  author_ids: number[];
}
