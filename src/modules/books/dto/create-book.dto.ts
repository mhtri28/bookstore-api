import { IsString, IsNotEmpty, IsNumber, IsInt, Min, ArrayNotEmpty, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'Harry Potter and the Sorcerers Stone' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 15.99 })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  category_id: number;

  @ApiProperty({ example: [1, 2], description: 'Array of author IDs' })
  @IsArray()
  @Type(() => Number)
  @ArrayNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
  @IsInt({ each: true })
  author_ids: number[];
}