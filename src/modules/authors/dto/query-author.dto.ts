import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryAuthorDto {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skip?: number;
  
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  take?: number;
  
  @ApiPropertyOptional({ example: 'Rowling' })
  @IsOptional()
  @IsString()
  name?: string;
  
  @ApiPropertyOptional({ example: 'created_at', enum: ['author_id', 'name', 'status', 'created_at', 'updated_at'] })
  @IsOptional()
  @IsIn(['author_id', 'name', 'status', 'created_at', 'updated_at'])
  orderBy?: string;
  
  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}