import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role, UserStatus } from 'src/generated/prisma/enums';

export class UpdateUserBodyDTO {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UpdateUserStatusBodyDTO {
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserRoleBodyDTO {
  @IsEnum(Role)
  role: Role;
}
