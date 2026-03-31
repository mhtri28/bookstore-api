import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSupplierDto {
  @ApiPropertyOptional({ example: 'XYZ Publisher' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'info@xyz.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 New Ave' })
  @IsOptional()
  @IsString()
  address?: string;
}