import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {

  @ApiProperty({
    example: 'NXB Kim Dong',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'contact@kimdong.vn',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '0909999999',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Ha Noi',
  })
  @IsOptional()
  @IsString()
  address?: string;
}