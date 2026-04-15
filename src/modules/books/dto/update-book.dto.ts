import { PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  category_id?: number;

  @ApiPropertyOptional({ example: [1, 3] })
  @IsArray()
  @Type(() => Number)
  @ArrayNotEmpty()
  @IsOptional()
  @IsInt({ each: true })
  author_ids?: number[];
}