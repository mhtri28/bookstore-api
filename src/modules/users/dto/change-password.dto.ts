import { IsString, Length, Matches } from 'class-validator';
import { Match } from 'src/shared/decorators/custom-validator.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordBodyDTO {
  @ApiProperty({ example: 'OldPassword@123' })
  @IsString()
  @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  })
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword@123' })
  @IsString()
  @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  })
  newPassword: string;

  @ApiProperty({ example: 'NewPassword@123' })
  @Match('newPassword', { message: 'Mật khẩu mới xác nhận không khớp' })
  confirmNewPassword: string;
}