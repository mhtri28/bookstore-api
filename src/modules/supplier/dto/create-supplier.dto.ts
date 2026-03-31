import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'ABC Publishing House' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'contact@abcpub.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '789 Publisher Avenue' })
  @IsOptional()
  @IsString()
  address?: string;
}