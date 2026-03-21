import { IsString } from 'class-validator';

export class UpdateAuthorDto {
  @IsString()
  name: string;
}
