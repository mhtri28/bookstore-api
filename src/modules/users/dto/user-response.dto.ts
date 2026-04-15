import { Role, UserStatus } from 'src/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class MappedUser {
  @ApiProperty({ example: 1 })
  user_id: number;
  @ApiProperty({ example: 'John Doe' })
  fullname: string;
  @ApiProperty({ example: 'john@example.com' })
  email: string;
  @ApiProperty({ enum: Role, example: 'USER' })
  role: Role;
  @ApiProperty({ enum: UserStatus, example: 'ACTIVE' })
  status: UserStatus;
  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  created_at: Date;
  @ApiProperty({ example: '2026-03-31T00:00:00Z' })
  updated_at: Date;
}

export class GetUserResDTO {
  @ApiProperty({ example: 'User retrieved successfully' })
  message: string;
  @ApiProperty({ type: () => MappedUser })
  user: MappedUser;

  constructor(partial: Partial<GetUserResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateUserResDTO extends GetUserResDTO {}

export class GetUsersResDTO {
  @ApiProperty({ example: 'Users retrieved successfully' })
  message: string;
  @ApiProperty({ type: [MappedUser] })
  data: MappedUser[];
  @ApiProperty({ example: { total: 10, page: 1, limit: 10, totalPages: 1 } })
  meta: { total: number; page: number; limit: number; totalPages: number };

  constructor(partial: Partial<GetUsersResDTO>) {
    Object.assign(this, partial);
  }
}

export class ChangePasswordResDTO {
  @ApiProperty({ example: 'Password changed successfully' })
  message: string;

  constructor(partial: Partial<ChangePasswordResDTO>) {
    Object.assign(this, partial);
  }
}