import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, UserStatus } from 'src/generated/prisma/enums';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUsersQueryDTO extends PaginationDto {
  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'john doe' })
  @IsOptional()
  @IsString()
  search?: string;
}