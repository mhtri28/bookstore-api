import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role, UserStatus } from 'src/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserBodyDTO {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UpdateUserStatusBodyDTO {
  @ApiProperty({ enum: UserStatus, example: 'ACTIVE' })
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserRoleBodyDTO {
  @ApiProperty({ enum: Role, example: 'ADMIN' })
  @IsEnum(Role)
  role: Role;
}