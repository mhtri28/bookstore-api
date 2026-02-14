import { Exclude } from 'class-transformer';
import { Role, UserStatus } from 'src/generated/prisma/enums';

export class UserModel {
  user_id: number;
  fullname: string;
  email: string;
  @Exclude()
  password: string;
  role: Role;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;

  constructor(partial: Partial<UserModel>) {
    Object.assign(this, partial);
  }
}
