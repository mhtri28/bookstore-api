import type { AuthorModel } from 'src/generated/prisma/models'; 
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthorResDTO {
  @ApiProperty({ example: 'Author created successfully' })
  message: string;
  
  @ApiPropertyOptional({ type: Object, description: 'Thông tin tác giả' })
  author: AuthorModel | null;

  constructor(partial: Partial<CreateAuthorResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateAuthorResDTO extends CreateAuthorResDTO {}

export class GetAuthorResDTO extends CreateAuthorResDTO {}

export class GetAuthorsResDTO {
  @ApiProperty({ example: 'Authors retrieved successfully' })
  message: string;
  
  @ApiProperty({ type: [Object], description: 'Danh sách tác giả' })
  authors: AuthorModel[];

  constructor(partial: Partial<GetAuthorsResDTO>) {
    Object.assign(this, partial);
  }
}

export class DeleteAuthorResDTO {
  @ApiProperty({ example: 'Author deleted successfully' })
  message: string;
  
  @ApiPropertyOptional({ type: Object, description: 'Thông tin tác giả' })
  author?: AuthorModel | null;

  constructor(partial: Partial<DeleteAuthorResDTO>) {
    Object.assign(this, partial);
  }
}