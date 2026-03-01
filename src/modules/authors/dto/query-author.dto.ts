import { Type } from 'class-transformer';
import { IsInt, IsOptional, isString, IsString, IsIn } from 'class-validator';

export class QueryAuthorDto {
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
  @IsIn(['author_id', 'name', 'status', 'created_at', 'updated_at'])
  orderBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
