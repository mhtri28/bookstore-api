import { UserModel } from 'src/shared/models/user.model';

export class GetUserResDTO {
  message: string;
  user: UserModel;

  constructor(partial: Partial<GetUserResDTO>) {
    Object.assign(this, partial);
  }
}
