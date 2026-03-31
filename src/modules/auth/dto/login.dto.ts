import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { UserModel } from 'src/generated/prisma/models';

export class LoginBodyDTO {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
  password: string;
}

export class LoginResDTO {
  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({
    example: {
      accessToken: 'access-token-example',
      refreshToken: 'refresh-token-example',
    },
  })
  tokens: {
    accessToken: string;
    refreshToken: string;
  };

  @ApiProperty({
    type: Object, 
    example: {
      id: 1,
      email: 'user@gmail.com',
      name: 'Nguyễn Văn A',
    },
  })
  user: UserModel;

  constructor(partial: Partial<LoginResDTO>) {
    Object.assign(this, partial);
  }
}