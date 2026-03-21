import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsOptional()
  @IsString()
  image_url?: string;
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  category_id?: number;

  @IsArray()
  @Type(() => Number)
  @ArrayNotEmpty()
  @IsOptional()
  @IsInt({ each: true })
  author_ids?: number[];
}
