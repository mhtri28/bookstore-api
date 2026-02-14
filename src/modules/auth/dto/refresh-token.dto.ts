import { IsString } from 'class-validator';

export class RefreshTokenBodyDTO {
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResDTO {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };

  constructor(partial: Partial<RefreshTokenResDTO>) {
    Object.assign(this, partial);
  }
}
