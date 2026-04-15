import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Science Fiction' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Sci-Fi books' })
  @IsString()
  @IsOptional()
  description?: string;
}