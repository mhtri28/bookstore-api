import { AuthorModel } from 'src/generated/prisma/models';

export class CreateAuthorResDTO {
  message: string;
  author: AuthorModel | null;

  constructor(partial: Partial<CreateAuthorResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateAuthorResDTO extends CreateAuthorResDTO {}

export class GetAuthorResDTO extends CreateAuthorResDTO {}

export class GetAuthorsResDTO {
  message: string;
  authors: AuthorModel[];

  constructor(partial: Partial<GetAuthorsResDTO>) {
    Object.assign(this, partial);
  }
}

export class DeleteAuthorResDTO {
  message: string;
  author?: AuthorModel | null;

  constructor(partial: Partial<DeleteAuthorResDTO>) {
    Object.assign(this, partial);
  }
}
