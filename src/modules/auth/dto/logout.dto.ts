import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutBodyDTO {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}

export class LogoutResDTO {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;

  constructor(partial: Partial<LogoutResDTO>) {
    Object.assign(this, partial);
  }
}