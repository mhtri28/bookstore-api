import { Controller, Get, Body, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UpdateUserBodyDTO,
  UpdateUserRoleBodyDTO,
  UpdateUserStatusBodyDTO,
} from './dto/update-user.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ChangePasswordBodyDTO } from './dto/change-password.dto';
import { GetUsersQueryDTO } from './dto/get-users-query.dto';
import {
  ChangePasswordResDTO,
  GetUserResDTO,
  GetUsersResDTO,
  UpdateUserResDTO,
} from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth(Role.ADMIN)
  @Get()
  async findAll(@Query() query: GetUsersQueryDTO) {
    const result = await this.usersService.findAll(query);
    return new GetUsersResDTO(result);
  }

  @Auth()
  @Get('profile')
  async getProfile(@ActiveUser('userId') userId: number) {
    const result = await this.usersService.findOne(userId);
    return new GetUserResDTO(result);
  }

  @Auth(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.findOne(id);
    return new GetUserResDTO(result);
  }

  @Auth()
  @Patch('profile')
  async updateProfile(
    @ActiveUser('userId') userId: number,
    @Body() body: UpdateUserBodyDTO,
  ) {
    const result = await this.usersService.updateProfile(userId, body);
    return new UpdateUserResDTO(result);
  }

  @Auth(Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserStatusBodyDTO,
  ) {
    const result = await this.usersService.updateStatus(id, body);
    return new UpdateUserResDTO(result);
  }

  @Auth()
  @Patch('change-password')
  async changePassword(
    @ActiveUser('userId') userId: number,
    @Body() body: ChangePasswordBodyDTO,
  ) {
    const result = await this.usersService.changePassword(userId, body);
    return new ChangePasswordResDTO(result);
  }

  @Auth(Role.ADMIN)
  @Patch(':id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserRoleBodyDTO,
  ) {
    const result = await this.usersService.updateRole(id, body);
    return new UpdateUserResDTO(result);
  }
}