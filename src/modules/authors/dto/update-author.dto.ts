import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAuthorDto {
  @ApiProperty({ example: 'Robert Galbraith' })
  @IsString()
  name: string;
}