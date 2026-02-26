import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;
}
