import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { UserModel } from 'src/generated/prisma/models';

export class LoginBodyDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
  //   message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  // })
  password: string;
}

export class LoginResDTO {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: UserModel;

  constructor(partial: Partial<LoginResDTO>) {
    Object.assign(this, partial);
  }
}
