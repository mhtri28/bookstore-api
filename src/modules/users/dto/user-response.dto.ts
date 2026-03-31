import { Role, UserStatus } from 'src/generated/prisma/enums';

export class MappedUser {
  user_id: number;
  fullname: string;
  email: string;
  role: Role;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export class GetUserResDTO {
  message: string;
  user: MappedUser;

  constructor(partial: Partial<GetUserResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateUserResDTO extends GetUserResDTO {}

export class GetUsersResDTO {
  message: string;
  data: MappedUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(partial: Partial<GetUsersResDTO>) {
    Object.assign(this, partial);
  }
}

export class ChangePasswordResDTO {
  message: string;

  constructor(partial: Partial<ChangePasswordResDTO>) {
    Object.assign(this, partial);
  }
}