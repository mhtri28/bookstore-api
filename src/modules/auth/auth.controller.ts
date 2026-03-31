import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterBodyDTO, RegisterResDTO } from 'src/modules/auth/dto/register.dto';
import { RefreshTokenBodyDTO, RefreshTokenResDTO } from 'src/modules/auth/dto/refresh-token.dto';
import { LoginBodyDTO, LoginResDTO } from 'src/modules/auth/dto/login.dto';
import { LogoutBodyDTO, LogoutResDTO } from 'src/modules/auth/dto/logout.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterBodyDTO) {
    const result = await this.authService.register(body);
    return new RegisterResDTO(result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginBodyDTO) {
    const result = await this.authService.login(body);
    return new LoginResDTO(result);
  }

  @Auth()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: RefreshTokenBodyDTO) {
    const result = await this.authService.refreshToken(body.refreshToken);
    return new RefreshTokenResDTO(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: LogoutBodyDTO) {
    const result = await this.authService.logout(body.refreshToken);
    return new LogoutResDTO(result);
  }
}
