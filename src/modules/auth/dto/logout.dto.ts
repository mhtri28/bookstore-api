import { IsString } from 'class-validator';

export class LogoutBodyDTO {
  @IsString()
  refreshToken: string;
}

export class LogoutResDTO {
  message: string;

  constructor(partial: Partial<LogoutResDTO>) {
    Object.assign(this, partial);
  }
}
