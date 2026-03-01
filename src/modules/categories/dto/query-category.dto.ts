import { Type } from 'class-transformer';
import { IsInt, IsOptional, isString, IsString, IsIn } from 'class-validator';

export class QueryCategoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skip?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  take?: number;
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsIn(['category_id', 'name', 'description', 'status', 'created_at', 'updated_at'])
  orderBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
