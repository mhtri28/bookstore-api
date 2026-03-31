import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({ example: 'J.K. Rowling' })
  @IsString()
  name: string;
}