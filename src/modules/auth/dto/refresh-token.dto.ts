import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenBodyDTO {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResDTO {
  @ApiProperty({ example: 'Token refreshed successfully' })
  message: string;
  
  @ApiProperty({
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newAccess...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newRefresh...',
    },
  })
  tokens: {
    accessToken: string;
    refreshToken: string;
  };

  constructor(partial: Partial<RefreshTokenResDTO>) {
    Object.assign(this, partial);
  }
}