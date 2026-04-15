import { Controller, Get, Body, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserBodyDTO, UpdateUserRoleBodyDTO, UpdateUserStatusBodyDTO } from './dto/update-user.dto';
import { Role } from 'src/generated/prisma/enums';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ChangePasswordBodyDTO } from './dto/change-password.dto';
import { GetUsersQueryDTO } from './dto/get-users-query.dto';
import { ChangePasswordResDTO, GetUserResDTO, GetUsersResDTO, UpdateUserResDTO } from './dto/user-response.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @Auth(Role.ADMIN)
  @Get()
  async findAll(@Query() query: GetUsersQueryDTO) {
    const result = await this.usersService.findAll(query);
    return new GetUsersResDTO(result);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @Auth()
  @Get('profile')
  async getProfile(@ActiveUser('userId') userId: number) {
    const result = await this.usersService.findOne(userId);
    return new GetUserResDTO(result);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @Auth(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.findOne(id);
    return new GetUserResDTO(result);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @Auth()
  @Patch('profile')
  async updateProfile(
    @ActiveUser('userId') userId: number,
    @Body() body: UpdateUserBodyDTO,
  ) {
    const result = await this.usersService.updateProfile(userId, body);
    return new UpdateUserResDTO(result);
  }

  @ApiOperation({ summary: 'Update user status' })
  @Auth(Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @ActiveUser('userId') userId: number,
    @Param('id') id: string,
    @Body() body: UpdateUserStatusBodyDTO,
  ) {
    const result = await this.usersService.updateStatus(userId, Number(id), body);
    return new GetUserResDTO(result);
  }

  @ApiOperation({ summary: 'Change current user password' })
  @Auth()
  @Patch('change-password')
  async changePassword(
    @ActiveUser('userId') userId: number,
    @Body() body: ChangePasswordBodyDTO,
  ) {
    const result = await this.usersService.changePassword(userId, body);
    return new ChangePasswordResDTO(result);
  }

  @ApiOperation({ summary: 'Update user role' })
  @Auth(Role.ADMIN)
  @Patch(':id/role')
  async updateRole(@ActiveUser('userId') userId: number, @Param('id') id: string, @Body() body: UpdateUserRoleBodyDTO) {
    const result = await this.usersService.updateRole(userId, Number(id), body);
    return new GetUserResDTO(result);
  }
}