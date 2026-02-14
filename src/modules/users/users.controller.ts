import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserBodyDTO, UpdateUserRoleBodyDTO, UpdateUserStatusBodyDTO } from './dto/update-user.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { GetUserResDTO } from 'src/modules/users/dto/get-user.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ChangePasswordBodyDTO } from 'src/modules/users/dto/change-password.dto';
import { GetUsersQueryDTO } from 'src/modules/users/dto/get-users-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth(Role.ADMIN)
  @Get()
  findAll(@Query() query: GetUsersQueryDTO) {
    return this.usersService.findAll(query);
  }

  @Auth()
  @Get('profile')
  async getProfile(@ActiveUser('userId') userId: number) {
    console.log(userId);
    const result = await this.usersService.findOne(userId);
    return new GetUserResDTO(result);
  }

  @Auth(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.usersService.findOne(Number(id));
    return new GetUserResDTO(result);
  }

  @Auth()
  @Patch('profile')
  async updateProfile(@ActiveUser('userId') userId: number, @Body() body: UpdateUserBodyDTO) {
    const result = await this.usersService.updateProfile(userId, body);
    return new GetUserResDTO(result);
  }

  @Auth(Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateUserStatusBodyDTO) {
    const result = await this.usersService.updateStatus(Number(id), body);
    return new GetUserResDTO(result);
  }

  @Auth()
  @Patch('change-password')
  changePassword(@ActiveUser('userId') userId: number, @Body() body: ChangePasswordBodyDTO) {
    return this.usersService.changePassword(userId, body);
  }

  @Auth(Role.ADMIN)
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body() body: UpdateUserRoleBodyDTO) {
    const result = await this.usersService.updateRole(Number(id), body);
    return new GetUserResDTO(result);
  }
}
