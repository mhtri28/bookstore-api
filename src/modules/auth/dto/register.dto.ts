import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { UserModel } from 'src/shared/models/user.model';
import { Match } from 'src/shared/decorators/custom-validator.decorator';
import { Type } from 'class-transformer';

export class RegisterBodyDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  })
  password: string;

  @Match('password', { message: 'Mật khẩu xác nhận không khớp' })
  confirmPassword: string;
}

export class RegisterResDTO {
  @IsString()
  message: string;

  @Type(() => UserModel)
  user: UserModel;

  constructor(partial: Partial<RegisterResDTO>) {
    Object.assign(this, partial);
  }
}
